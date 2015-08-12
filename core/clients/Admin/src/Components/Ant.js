'use strict';

var React = require('react');
var Modifiable = React.createFactory(require('./Modifiable.js'));
var AntPicker = React.createFactory(require('./AntPicker.js'));

var moment = require('moment');

/*

interface AntProps{
    ant: {
        create_at : string,
        id: int,
        installed_at: int,
        isUpdating: boolean,
        latest_input: string,
        latest_output: string,
        name: string,
        phone_number: string,
        quipu_status: string,
        sense_status: string,
        updated_at: string,
        isSelected: bool
    },
    antIDset : Set,
    currentPlaceId : int,
    onChangeSensor: function(),
    onSelectedAnts: function()
}
interface AntState{
    isListOpen: boolean
}

*/

var Ant = React.createClass({
    displayName: 'Ant',

    getInitialState: function(){
        return {
            isOpen: false,
            isSelected: false
        };
    },

    setSelected: function(isSelected){
        this.setState(Object.assign(this.state, {
            isSelected: isSelected
        }));
    },

    toggleList: function(){
        this.setState(Object.assign(this.state, {
            isListOpen: !this.state.isListOpen
        }));
    },

    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;

        // console.log('ANT props', props);
        // console.log('ANT state', state);

        var classes = [
            'ant',
            state.isSelected ? 'isSelected' : ''
            // props.ant.isUpdating ? 'updating' : '',
            // props.ant.quipu_status,
            // props.ant.sense_status
        ];

        return React.DOM.div({className: classes.join(' ')},
            React.DOM.form({className: 'ant-selector'},
                React.DOM.input({
                    onClick: function(){
                        self.setSelected(!state.isSelected);
                        props.onSelectedAnts(props.ant.id);
                    },
                    type: "checkbox"
                })
            ),
            React.DOM.ul({},
                React.DOM.li({}, 
                    React.DOM.div({}, 'Name'),
                    new Modifiable({
                        className: 'sensorName',
                        isUpdating: false,
                        text: props.ant.name,
                        dbLink: {
                            id: props.ant.id,
                            field: 'name'
                        },
                        onChange: props.onChangeSensor
                    }),
                    React.DOM.div({
                        className: 'ant-id',
                        onClick: function(){
                                console.log('open ant list');
                                self.toggleList();
                            }
                        },
                        props.ant.id
                    ),
                    new AntPicker({
                        antIDset: props.antIDset.remove(props.ant.id),
                        currentSensorId: props.ant.id,
                        isOpen: state.isListOpen,
                        currentPlaceId: props.currentPlaceId,
                        onChange: function(dbData){
                            self.toggleList();
                            props.onChangeSensor(dbData);
                        }
                    })
                ),
                
                React.DOM.li({}, 
                    React.DOM.div({}, 'Created'),
                    React.DOM.div({}, moment(props.ant.created_at).format("MMMM Do YYYY, h:mm:ss a"))
                ),
                React.DOM.li({}, 
                    React.DOM.div({}, 'Updated'),
                    React.DOM.div({}, moment(props.ant.updated_at).fromNow())
                ),
                React.DOM.li({}, 
                    React.DOM.div({}, 'Phone'),
                    new Modifiable({
                        className: 'sensorPhone_number',
                        isUpdating: false,
                        text: props.ant.phone_number,
                        dbLink: {
                            id: props.ant.id,
                            field: 'phone_number'
                        },
                        onChange: props.onChangeSensor
                    })
                ),
                React.DOM.li({className: 'quipu'},
                    React.DOM.div({}, 'Quipu Status'),
                    React.DOM.div({}, props.ant.quipu_status),
                    React.DOM.div({}, props.ant.signal) // Pas de signal ???
                ),
                React.DOM.li({className: '6sense'},
                    React.DOM.div({}, '6sense Status'),
                    React.DOM.div({}, props.ant.sense_status)
                ),
                React.DOM.li({className: 'command'},
                    React.DOM.div({}, 'Latest Command'),
                    React.DOM.div({}, props.ant.latest_input),
                    React.DOM.div({}, props.ant.latest_output)
                )
            )
        );
    }
});

module.exports = Ant;