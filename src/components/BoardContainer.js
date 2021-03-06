import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {BoardDiv} from '../styles/Base'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {DragDropContext} from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch'
import Lane from './Lane'

const boardActions = require('../actions/BoardActions')
const laneActions = require('../actions/LaneActions')

class BoardContainer extends Component {
  wireEventBus = () => {
    let eventBus = {
      publish: event => {
        switch (event.type) {
          case 'ADD_CARD':
            return this.props.actions.addCard({laneId: event.laneId, card: event.card})
          case 'REMOVE_CARD':
            return this.props.actions.removeCard({laneId: event.laneId, cardId: event.cardId})
          case 'REFRESH_BOARD':
            return this.props.actions.loadBoard(event.data)
        }
      }
    }
    this.props.eventBusHandle(eventBus)
  }

  componentWillMount () {
    this.props.actions.loadBoard(this.props.data)
    if (this.props.eventBusHandle) {
      this.wireEventBus()
    }
  }

  componentWillReceiveProps (nextProps) {
    // nextProps.data changes when Board input props change and reducerData changes due to event bus changes
    const {data, reducerData} = this.props
    if (this.props.onDataChange && nextProps.reducerData && reducerData !== nextProps.reducerData) {
      this.props.onDataChange(nextProps.reducerData)
    }
    if (nextProps.data && nextProps.data !== data) {
      this.props.actions.loadBoard(nextProps.data)
    }
  }

  render () {
    const {reducerData, style, ...otherProps} = this.props
    return (
      <BoardDiv style={style} {...otherProps}>
        {reducerData.lanes.map(lane => {
          const {id, ...otherProps} = lane
          const {
            tagStyle,
            draggable,
            handleDragStart,
            handleDragEnd,
            onCardClick,
            onLaneClick,
            onLaneScroll,
            laneSortFunction,
            customCardLayout,
            cardStyle,
            children
          } = this.props
          return (
            <Lane
              key={`${id}`}
              id={id}
              {...otherProps}
              {...{
                tagStyle,
                draggable,
                handleDragStart,
                handleDragEnd,
                onCardClick,
                onLaneClick,
                onLaneScroll,
                laneSortFunction,
                customCardLayout,
                cardStyle,
                children
              }}
            />
          )
        })}
      </BoardDiv>
    )
  }
}

BoardContainer.propTypes = {
  data: PropTypes.object.isRequired,
  onLaneScroll: PropTypes.func,
  onCardClick: PropTypes.func,
  onLaneClick: PropTypes.func,
  eventBusHandle: PropTypes.func,
  laneSortFunction: PropTypes.func,
  draggable: PropTypes.bool,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func,
  onDataChange: PropTypes.func,
  customCardLayout: PropTypes.bool,
  style: PropTypes.object
}

const mapStateToProps = state => {
  return state.lanes ? {reducerData: state} : {}
}

const mapDispatchToProps = dispatch => ({actions: bindActionCreators({...boardActions, ...laneActions}, dispatch)})

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(MultiBackend(HTML5toTouch))(BoardContainer))
