import React, { useRef, useState } from "react";
import ReactDom from "react-dom";
//@ts-ignore
import reactToWebComponent from "react-to-webcomponent";
import { BoggleBoard, GameState, GameStatus } from "../../../../api/types";
import { HathoraConnection } from "../../../.hathora/client";


function BoggleBoardComponent({ val, state, client }: { val: BoggleBoard; state: GameState; client: HathoraConnection }) {
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);

  const onSubmit = async () => {
    const guess = selectedPositions.map((pos) => val[pos]).join("");
    setSelectedPositions([]);
    const response = await client.makeGuess({ guess });
    if (response.type === "error") {
      console.error(response.error);
    }
  }

  const setSelected = (position: number) => (isSelected: boolean) => {
    if (!isSelected) {
      const index = selectedPositions.indexOf(position);
      if (index < 0) {
        // throw error
      } else {
        setSelectedPositions(selectedPositions.slice(0, index));
      }
    } else {
      setSelectedPositions(selectedPositions.concat([position]));
    }
  }

  const tableElement = <table>
    {Array(4).fill(0).map((_, i) =>
      <th>
        {Array(4).fill(0).map((_, j) =>
          <tr>
            <BoggleLetter letter={val[4 * i + j]} isSelected={selectedPositions.includes(4 * i + j)} setSelected={setSelected(4 * i + j)} />
          </tr>
        )}
      </th>)}
  </table>;

  return <div>
    {tableElement}
    <button
      onClick={onSubmit}
    >
      Submit
    </button>
  </div>;
}

interface IBoggleLetterProps {
  letter: string,
  isSelected: boolean;
  setSelected: (isSelected: boolean) => void;
}

function BoggleLetter(props: IBoggleLetterProps) {
  const onClick = () => {
    props.setSelected(!props.isSelected);
  }

  const divStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "6px",
    border: "2px solid white",
    margin: "2px",
    outline: "1px solid black",
    fontSize: "2rem",
    boxShadow: "2px 2px 2px 2px black",
  };

  if (props.isSelected) {
    divStyle.background = "yellow";
  }
  return <div
    className="boggle-letter"
    style={divStyle}
    onClick={onClick}
  >
    {props.letter}
  </div>
}

export default reactToWebComponent(BoggleBoardComponent, React, ReactDom);
