import React from 'react';
import { convertNote, parseRawStringPhrase, InvalidInputError } from './note-conversion.js'
import MIDISounds from 'midi-sounds-react';

const defaultRoutine = {
  routine: "1 2 3 4 5 6 5 4 3 2 1",
  name: "Major Scale 6 notes",
  author: "wlee221"
};

class RoutinePlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: false,
      chosenRoutine: defaultRoutine,
      errorMessage: null,
      tempo: 120,
      startNote: "C4",
      endNote: "G5"
    }
  }


  startPractice(startNote, endNote, notes) {
    // TODO: add pause and stop button.
    if (this.state.playing) return;
    // console.log(startNote, endNote, notes);
    const increment = startNote - notes[0];
    const highestNoteOnPhrase = Math.max(...notes) + increment;
    const nRoutines = endNote - highestNoteOnPhrase + 1;
    // console.log(increment, highestNoteOnPhrase, nRoutines);
    if (nRoutines <= 0) {
      this.setState({ errorMessage: "Your phrase goes too high for your selected end note. Either increase your end note or lower your start note." });
      return;
    }
    const note_length = 60 / this.state.tempo; // quarter note length
    this.setState({ playing: true })
    for (var i = 0; i < nRoutines; ++i) {
      for (var j = 0; j < notes.length; ++j) {
        // TODO: Move down the scale too
        const note = notes[j] + increment + i;
        const time = (j * note_length + notes.length * note_length * i + note_length * i) * 1000;
        const finished = (i === nRoutines - 1 && j === notes.length - 1)
        this.playNoteAt(note, time, note_length, finished)
      }
    }
  }

  playNoteAt(note, time, note_length, finished) {
    setTimeout(() => {
      if (finished) {
        this.setState({ playing: false })
      }
      this.midiSounds.playChordNow(3, [note], note_length);
      // TODO: call next setTimeout here so that only one timeout is active while the app is running.
    }, time)
  }

  onSubmit() {
    if (this.state.playing) return;
    this.setState({ errorMessage: null })
    var startNote, endNote, notes;
    // input validation using a try catch block
    try {
      startNote = convertNote(this.state.startNote);
      endNote = convertNote(this.state.endNote);
      notes = parseRawStringPhrase(this.state.chosenRoutine.routine);
    } catch (err) {
      if (err instanceof InvalidInputError) {
        this.setState({ errorMessage: err.message });
        return;
      } else {
        throw err;
      }
    }
    this.startPractice(startNote, endNote, notes);
  }

  render() {
    var routines = this.props.userRoutines || [];
    routines = [defaultRoutine, ...routines]
    this.routines = routines;
    var routineOptions = this.routines.map((val, idx) => {
      return (
        <option key={`routine${idx}`} value={idx}>
          {val.name}
        </option>
      )
    });
    return (
      <div className="player">
        <MIDISounds
          ref={(ref) => this.midiSounds = ref}
          appElementName="root" instruments={[3]}
        />
        <h2>Start Routine</h2>
        <br />Choose your routine:&nbsp;&nbsp;
        <select className="routines" onChange={evt =>
          this.setState({
            chosenRoutine: this.routines[evt.target.value]
          })
        }>
          {routineOptions}
        </select>
        <br />
        <br /> Set your practice settings. If you are unsure of your range, try
          C4~G5 for men and G4~C6 for women then adjust accordingly. <br />
        <form>
          <label>
            <br /> Start Note (ex. E#4):
            <input
              type="text"
              name="startNote"
              defaultValue={this.state.startNote}
              maxLength="3"
              onChange={
                evt => this.setState({
                  [evt.target.name]: evt.target.value,
                })
              }
            />
          </label>
          <label>
            <br />End Note (ex. C6):
            <input
              type="text"
              name="endNote"
              maxLength="3"
              defaultValue={this.state.endNote}
              onChange={
                evt => this.setState({
                  [evt.target.name]: evt.target.value,
                })
              }
            />
          </label>
          <label>
            <br />Tempo (BPM):
            <input
              type="number"
              name="tempo"
              defaultValue={this.state.tempo}
              onChange={
                evt => this.setState({
                  [evt.target.name]: evt.target.value,
                })
              }
            />
          </label>
          <br />
          <input
            type="button"
            value="Start Practicing!"
            onClick={() => {
              this.onSubmit();
            }}
          />
        </form>
        <font color='red'>{this.state.errorMessage}</font>
      </div>
    )
  }
}

export default RoutinePlayer;