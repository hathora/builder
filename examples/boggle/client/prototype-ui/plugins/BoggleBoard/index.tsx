import React, { useState } from "react";
import ReactDom from "react-dom";
//@ts-ignore
import reactToWebComponent from "react-to-webcomponent";
import { BoggleBoard } from "../../../../api/types";
import { HathoraConnection } from "../../../.hathora/client";

function BoggleBoardComponent({ val, client }: { val: BoggleBoard; client: HathoraConnection }) {
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);

  const onSubmit = async () => {
    const guess = selectedPositions.map((pos) => val[pos]).join("");
    setSelectedPositions([]);
    const response = await client.makeGuess({ guess });
    if (response.type === "error") {
      console.error(response.error);
    }
  };

  const setSelected = (position: number) => (isSelected: boolean) => {
    if (!isSelected) {
      const index = selectedPositions.indexOf(position);
      if (index < 0) {
        console.error("current letter not already selected");
      } else {
        setSelectedPositions(selectedPositions.slice(0, index));
      }
    } else {
      setSelectedPositions(selectedPositions.concat([position]));
    }
  };

  const tableElement = (
    <table>
      <tbody>
        {[...Array(4)].map((_, i) => (
          <tr key={i}>
            {[...Array(4)].map((_, j) => (
              <td key={j}>
                <BoggleLetter
                  letter={val && val.length > 0 ? val[4 * i + j] : ""}
                  isSelected={selectedPositions.includes(4 * i + j)}
                  setSelected={setSelected(4 * i + j)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      {tableElement}
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
}

interface IBoggleLetterProps {
  letter: string;
  isSelected: boolean;
  setSelected: (isSelected: boolean) => void;
}

function BoggleLetter(props: IBoggleLetterProps) {
  const style: React.CSSProperties = {
    width: "50px",
    height: "50px",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "6px",
    border: "2px solid white",
    margin: "2px",
    outline: "1px solid black",
    fontSize: "2rem",
    boxShadow: "2px 2px 2px 2px black",
    background: props.isSelected ? "yellow" : "",
  };
  return (
    <div className="boggle-letter" style={style} onClick={() => props.setSelected(!props.isSelected)}>
      {props.letter}
    </div>
  );
}

export default reactToWebComponent(BoggleBoardComponent, React, ReactDom);
