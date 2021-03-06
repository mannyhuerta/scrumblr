import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Draggable from 'react-draggable';
import Transition from 'react-transition-group/Transition'
import {
    DropTarget,
} from 'react-dnd'
import Sticker from '../Sticker/Sticker'
import { RIETextArea } from '../REIK'
import cards from './images';
import close from './images/delete.png';


function FadeTransition({ children, duration, in: inProp }) {
    const defaultStyle = {
        transition: `${duration}ms ease-in`,
        transitionProperty: 'opacity, transform'
    }

    const transitionStyles = {
        entering: {
            opacity: 0,
            transform: 'translateY(-10%)'
        },
        entered: {
            opacity: 1,
            transform: 'translateY(0)'
        },
        exiting: {
            opacity: 0,
            transform: 'translateY(-10%)'
        }
    };

    return (
        <Transition in={inProp} timeout={{
            enter: 0,
            exit: duration
        }}>
            {
                (state) => {

                    if (state === 'exited') {
                        return null;
                    }

                    return React.cloneElement(children, {
                        style: Object.assign({}, defaultStyle, transitionStyles[state])
                    })
                }
            }
        </Transition>
    )
}

const CloseButton = (props) => (
    <img src={close} onMouseOver={props.onMouseOver} onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave} style={{ zIndex: props.zIndex }} className={`card-icon ${props.inside ? 'icons-visible' : 'icons-invisible'}`} onClick={() => { props.removeCard() }} />
)

const cardTarget = {
    drop(props, monitor) {
        props.card.addSticker(monitor.getItem().color)()
        return {
            color: monitor.getItem().color
        };
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

class Card extends Component {
    constructor(props) {
        super(props)
        const { card } = this.props
        this.state = {
            inside: false,
            activeDrags: 0,
            controlledPosition: {
                x: 0, y: 0
            },
            disableDragging: false,
            startPosition: { x: parseInt(card.x), y: parseInt(card.y) },
            hoveringOnClose: false,
            editing: false
        }

    }

    onControlledDrag(e, position) {
        const { x, y } = position;
        const { card } = this.props
        this.setState({ controlledPosition: { x, y }, isDragging: true });
        card.move(x, y)
    }

    handleStart() {
        const { card, scrumblr } = this.props
        const zindex = scrumblr.getMoves(card.board) + 1
        scrumblr.setMoves(card.board, zindex)

        if (!this.state.hoveringOnClose)
            card.setzIndex(zindex)()
    }


    onCloseEnter = () => {
        this.setState({ hoveringOnClose: true, disableDragging: true })
    }
    onCloseLeave = () => {
        this.setState({ hoveringOnClose: false, disableDragging: false })
    }
    onEnter = () => {
        if (!this.state.disableDragging) // if we leave/enter the box while editing, rerender causes us to lose focus
            this.setState({ inside: true })
    }

    hover = () => {
        if (!this.state.disableDragging) // if we leave/enter the box while editing, rerender causes us to lose focus
            this.setState({ inside: true })
    }

    onLeave = () => {
        if (!this.state.disableDragging)
            this.setState({ inside: false })
    }

    removeCard = () => {
        const { scrumblr, card } = this.props
        scrumblr.removeCard(card.id, card.board)()
    }

    handleStop = (e, data) => {
        const { card } = this.props
        if (this.state.startPosition.x !== data.x || this.state.startPosition.y !== data.y)
            card.move(data.x, data.y)()
        this.setState({ startPosition: { x: data.x, y: data.y }, isDragging: false })
    }

    dataChanged(data) {
        // data = { description: "New validated text comes here" }
        // Update your model from here
        const { card } = this.props
        card.updateText(data.text)()
        //this.setState({ ...data })
    }

    disableDrag() {
        this.setState({ disableDragging: true })
    }
    enableDrag() {
        this.setState({ disableDragging: false })
    }
    beforeStartEditing() {
        const { card } = this.props
        card.startEditing()
        this.setState({ disableDragging: true, editing: true })
    }
    afterFinishEditing() {
        const { card } = this.props
        this.setState({ disableDragging: false, editing: false })
        card.endEditing()
    }

    render() {
        const dragHandlers = { onStop: this.handleStop };
        const { card, canDrop, isOver, connectDropTarget } = this.props
        const position = { x: parseInt(card.x), y: parseInt(card.y) }
        console.log(this.state.editing, card.editing)
        return connectDropTarget(<div style={{
            "zIndex": `${card.zindex}`,
            position: "absolute"
        }}>
            <Draggable
                {...dragHandlers}
                onStart={this.handleStart.bind(this)}
                onDrag={this.onControlledDrag.bind(this)}
                handle=".handle"
                position={position}
                onStop={this.handleStop}
                disabled={this.state.disableDragging || card.editing} >
                <div onMouseEnter={this.onEnter} onMouseLeave={this.onLeave} onMouseOver={this.hover} style={{ transition: this.state.isDragging ? '' : 'transform .5s' }} >
                    <FadeTransition duration={500} key={card.id} in={true}>
                        <div>
                            <div id={card.id} className='card handle' style={{
                                transform: `rotate(${card.rot}deg)`,
                                WebkitTransform: `rotate(${card.rot}deg)`
                            }} >
                                {(!this.state.editing && !card.editing) && <CloseButton zIndex={card.zindex + 1} removeCard={this.removeCard} inside={this.state.inside} onMouseEnter={this.onCloseEnter} onMouseLeave={this.onCloseLeave} />}
                                <img className="card-image" src={cards[card.color]} />
                                <div className="stickertarget droppable">
                                    <RIETextArea
                                        shouldStartEditOnDoubleClick={true}
                                        className='content'
                                        classEditing='content-editing'
                                        value={card.editing ? `${card.editingBy} is typing..` : card.text}
                                        beforeStart={this.beforeStartEditing.bind(this)}
                                        afterFinish={this.afterFinishEditing.bind(this)}
                                        change={this.dataChanged.bind(this)}
                                        disabled={card.editing}
                                        propName='text'
                                    />
                                </div>
                                <span className="filler">{card.sticker && card.sticker.map(sticker => <Sticker key={sticker} color={sticker} />)}</span>
                            </div>
                        </div>
                    </FadeTransition>
                </div>
            </Draggable >
        </div>)
    }
}

export default DropTarget('sticker', cardTarget, collect)(observer(Card))
