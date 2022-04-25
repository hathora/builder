import styled from "styled-components";

const CardWrapper = styled.div<{ disabled?: boolean; active?: boolean }>`
  line-height: 75px;
  width: calc(100vw / 13);
  height: calc(100vw / 10);
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
  background-color: ${({ active }) => (active ? "green" : "gray")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : "initial")};
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
