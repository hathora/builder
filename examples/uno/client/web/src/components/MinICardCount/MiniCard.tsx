import { Color } from "../../../../../api/types";
import styled from "styled-components";

const CardWrapper = styled.div`
  line-height: 75px;
  width: 0.5em;
  height: 0.75em;
  text-align: center;
  cursor: pointer;
  border: 1px solid white;
  outline: 1px solid black;
  display: flex;
  border-radius: 2px;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  color: white;
  text-shadow: 1px 2px #000000;
  box-shadow: 2px 2px 0px 0px black;
  background-color: black;
`;

const MiniCardsRow = ({ count }: { count: number }) => {
  const card = new Array(count).fill(null, 0, count).map((_, i) => i);
  return (
    <div className="flex flex-wrap">
      {card.map((i) => (
        <CardWrapper key={i} className="m-1" />
      ))}
    </div>
  );
};

export default MiniCardsRow;
