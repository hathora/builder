import { Color } from "../../../../../api/types";
import styled from "styled-components";

let DISPLAY_COLORS = {
  [Color.RED]: "#e16c6c",
  [Color.BLUE]: "#6c91d9",
  [Color.GREEN]: "#70bd56",
  [Color.YELLOW]: "#fcda49",
};

const CardWrapper = styled.div<{ colorV: Color; disabled?: boolean }>`
  line-height: 75px;
  width: calc(100vw / 10);
  height: calc(100vw / 7);
  text-align: center;
  cursor: pointer;
  border: 2px solid white;
  outline: 1px solid black;
  display: flex;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: white;
  text-shadow: 1px 2px #000000;
  box-shadow: 2px 2px 0px 0px black;
  background-color: ${({ colorV }) => DISPLAY_COLORS[colorV]};
  opacity: ${({ disabled }) => (disabled ? 0.5 : "initial")};
`;

const CardValue = ({
  color,
  value,
  onClick,
  disabled,
}: {
  disabled?: boolean;
  color: Color;
  value: number;
  onClick?: () => void;
}) => {
  return (
    <CardWrapper disabled={disabled} onClick={!disabled ? onClick : undefined} className="mx-3 mt-2" colorV={color}>
      {value}
    </CardWrapper>
  );
};

export default CardValue;
