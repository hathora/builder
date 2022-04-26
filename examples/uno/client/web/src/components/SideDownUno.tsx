import styled from "styled-components";
import { BaseCard } from "./BaseCard";

const CardWrapper = styled.div<{ disabled?: boolean; active?: boolean }>`
  background-color: ${({ active }) => (active ? "green" : "gray")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : "initial")};
  ${BaseCard}
`;

const SideDownUno = ({
  disabled,
  active,
  label,
  onClick,
}: {
  disabled?: boolean;
  active?: boolean;
  label?: string;
  onClick?: () => void;
}) => {
  return (
    <>
      <CardWrapper disabled={disabled} onClick={onClick} active={active} className="mx-3 mt-2">
        {label}
      </CardWrapper>
    </>
  );
};

export default SideDownUno;
