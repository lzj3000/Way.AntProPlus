import React from 'react';
import WayPage from './components/waypage'
import WayTreePage from './components/waytreepage'
import WayTablePage from './components/waytablepage'

export default class DataPage extends React.Component {
    page = null
    constructor(props) {
        super(props)
    }

    onRef = (page) => {
        this.page = page
    }
    render() {
        let type = this.props.match.params.type
        if (type == undefined || type == 'page') {
            return (
                <WayPage controller={this.props.match.params.path} onRef={this.onRef} parent={this}></WayPage>
            )
        }
        if (type == 'table') {
            return (
                <WayTablePage controller={this.props.match.params.path} onRef={this.onRef} parent={this}></WayTablePage>
            )
        }
        if (type == 'tree') {
            return (
                <WayTreePage controller={this.props.match.params.path} onRef={this.onRef} parent={this}></WayTreePage>
            )
        }
    }

    componentDidUpdate = () => {
        if (this.page) {
            this.page.renderView()
        }
    }
};