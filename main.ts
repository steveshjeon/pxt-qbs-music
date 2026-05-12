enum NoteKey {
    //% block="C"
    C = 0,
    //% block="C#"
    CSharp = 1,
    //% block="D"
    D = 2,
    //% block="D#"
    DSharp = 3,
    //% block="E"
    E = 4,
    //% block="F"
    F = 5,
    //% block="F#"
    FSharp = 6,
    //% block="G"
    G = 7,
    //% block="G#"
    GSharp = 8,
    //% block="A"
    A = 9,
    //% block="A#"
    ASharp = 10,
    //% block="B"
    B = 11
}

enum ScaleType {
    //% block="Major"
    Major = 0,
    //% block="Minor"
    Minor = 1,
    //% block="Pentatonic"
    Pentatonic = 2
}

enum SoundEffect {
    //% block="Flat (Straight Tone)"
    Flat = 0,
    //% block="Beautiful Vibrato"
    Vibrato = 1
}

/**
 * QBS Music Extension
 */
//% color=#0fbc11 icon="\uf001" weight=90
//% groups='["Music Config", "Play"]'
namespace QBS {
    let currentScale = ScaleType.Major;
    let scaleRootMidi = 48; // default to C3
    let startingNoteMidi = 55; // default to G3
    let noteCount = 20;

    /**
     * Set up the music configuration for the play note block.
     * @param root the scale root key
     * @param scale the musical scale type
     * @param note the starting note letter
     * @param octave the starting octave, eg: 3
     * @param count number of available notes, eg: 20
     */
    //% block="set music config | scale root $root type $scale | starting note $note octave $octave | notes available $count"
    //% root.defl=NoteKey.C scale.defl=ScaleType.Major
    //% note.defl=NoteKey.G octave.defl=3 octave.min=0 octave.max=8
    //% count.defl=20 count.min=1 count.max=50
    //% group="Music Config" weight=100
    //% help="jeons1qbs/pxt-qbs-music/docs/setup-music"
    export function setupMusic(root: NoteKey, scale: ScaleType, note: NoteKey, octave: number, count: number): void {
        currentScale = scale;
        // Assume octave 3 for root logic (it repeats anyway)
        scaleRootMidi = root + 48;
        startingNoteMidi = note + (octave + 1) * 12;
        noteCount = count;
    }

    function isNoteInScale(midi: number, scaleRoot: number, type: ScaleType): boolean {
        let semitone = (midi - scaleRoot) % 12;
        if (semitone < 0) semitone += 12;
        
        if (type == ScaleType.Major) {
            return semitone == 0 || semitone == 2 || semitone == 4 || semitone == 5 || 
                   semitone == 7 || semitone == 9 || semitone == 11;
        } else if (type == ScaleType.Minor) {
            return semitone == 0 || semitone == 2 || semitone == 3 || semitone == 5 || 
                   semitone == 7 || semitone == 8 || semitone == 10;
        } else if (type == ScaleType.Pentatonic) {
            return semitone == 0 || semitone == 2 || semitone == 4 || semitone == 7 || semitone == 9;
        }
        return false;
    }

    function getMidiFromIndex(targetIndex: number): number {
        let midi = startingNoteMidi;
        
        // Find the 0th note (first note in scale >= startingNoteMidi)
        while (!isNoteInScale(midi, scaleRootMidi, currentScale)) {
            midi++;
        }
        
        // Step forward targetIndex times
        for (let i = 0; i < targetIndex; i++) {
            midi++;
            while (!isNoteInScale(midi, scaleRootMidi, currentScale)) {
                midi++;
            }
        }
        return midi;
    }

    /**
     * Plays a note based on the scale index and applies a sound effect.
     * Tilting the micro:bit forward/backward will bend the pitch.
     * @param index the note number to play, eg: 0
     * @param effect the sound style to play
     */
    //% block="🎵 play note $index with $effect effect"
    //% index.defl=0
    //% group="Play" weight=90
    //% help="jeons1qbs/pxt-qbs-music/docs/play-note"
    export function playNote(index: number, effect: SoundEffect): void {
        // Constrain index
        if (index < 0) index = 0;
        if (index >= noteCount) index = noteCount - 1;

        let baseMidi = getMidiFromIndex(index);
        
        // Pitch bend from tilt
        let y = input.acceleration(Dimension.Y);
        let pitchModifier = 0;
        if (y < -300) { pitchModifier = -1; } // Tilt forward -> down
        else if (y > 300) { pitchModifier = 1; } // Tilt backward -> up

        let finalMidi = baseMidi + pitchModifier;
        let freq = 440 * Math.pow(2, (finalMidi - 69) / 12);

        if (effect == SoundEffect.Vibrato) {
            let time = input.runningTime();
            freq = freq + Math.sin(time / 30) * (freq * 0.015);
        }

        music.ringTone(freq);
    }

    /**
     * Stops the music playback immediately.
     */
    //% block="⏹️ stop playing note"
    //% group="Play" weight=80
    //% help="jeons1qbs/pxt-qbs-music/docs/stop-note"
    export function stopNote(): void {
        music.rest(0);
    }
}
