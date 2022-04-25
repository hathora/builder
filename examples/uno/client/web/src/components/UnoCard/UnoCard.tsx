import { Color } from "../../../../../api/types";
import styled from "styled-components";
import { BaseCard } from "../BaseCard/BaseCard";

let DISPLAY_COLORS = {
  [Color.RED]: "#e16c6c",
  [Color.BLUE]: "#6c91d9",
  [Color.GREEN]: "#70bd56",
  [Color.YELLOW]: "#fcda49",
};

const CardWrapper = styled.div<{ colorV: Color; disabled?: boolean; cursor?: string }>`
  background-color: ${({ colorV }) => DISPLAY_COLORS[colorV]};
  opacity: ${({ disabled }) => (disabled ? 0.5 : "initial")};
  ${BaseCard}
`;

const CardValue = ({
  color,
  value,
  onClick,
  disabled,
  cursor,
}: {
  disabled?: boolean;
  color: Color;
  value: number;
  onClick?: () => void;
  cursor?: string;
}) => {
  return (
    <CardWrapper
      cursor={cursor}
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
      className="mx-2 md:mx-3 mt-2"
      colorV={color}
    >
      {value}
    </CardWrapper>
  );
};

export default CardValue;
