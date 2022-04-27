import { Stage, Sprite } from '@inlet/react-pixi'

export default function Game() {
    return <Stage>
        <Sprite image="./bunny.png" x={100} y={100} />
    </Stage>
}
