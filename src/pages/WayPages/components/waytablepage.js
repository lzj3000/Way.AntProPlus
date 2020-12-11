import React from 'react';
import { DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import ProTable, { ProColumns, ProColumnsValueType, ActionType } from '@ant-design/pro-table';
import { Button, Divider, Dropdown, Menu, message, Input, Modal, Form, Tabs } from 'antd';
import { PageHeaderWrapper, RouteContext } from '@ant-design/pro-layout';
import WayForm from './wayform';
import WayFormTable from './wayformtable';
import WayTable from './waytable'
import { view, find, Remove, Create, Update, Execute } from './service';

const { confirm } = Modal;
const { TabPane } = Tabs;

export default class WayTablePage extends React.Component {
  view = null
  controller = ''
  title = ''
  table = null
  form = null

  initPageData = () => {
    this.editrow = null
  }
  constructor(props) {
    super(props)
    this.state = {
      table: null,
      form: null,
      tabindex: 0,
      command: null,
      success: false
    }
    this._getview(props)
    console.log('waypage.constructor')
  }
  renderView = () => {
    this.setState({ success: false }, () => {
      this._getview(this.props)
    });
  }
  _getview = (props) => {
    this.controller = props.controller
    view(this.controller).then(res => {
      if (res.success) {
        this.view = res.result
        var table = this.initTable()
        //table.modelview = this.view.modelview
        table.columns = this.view.modelview.childitem
        table.commands = this.view.commands
        var form = this.initForm()
        //form.modelview = this.view.modelview
        //form.name = this.view.modelview.name
        form.fields=this.view.modelview.childitem
        this.setState({ table: table, form: form, success: true });
      }
    })
  }
  initTable = () => {
    var table = {
      columns: null,
      commands: null,
      onSearchClick: (item, fn, table) => {
        this.findDataSource(item, fn)
      },
      onRowDoubleClick: (row, table) => {
        table.rowSelect(row, true)
        table.commandClick('Update')
      },
      onCommandClick: (command, table) => {
        this.state.command = command
        if (command.command == "Create" || command.command == "Update") {
          this.form.show(command,() => {
            this.form.clear()
          })
          if (command.command == "Update") {
            this.form.show(command,() => {
              this.form.setObj(command.selectRows[0])
            })
          }
          return
        }
        var data = (command.isselectmultiple) ? command.selectRows : command.selectRows[0]
        var url = (command.isselectmultiple) ? '/multiple' : ''
        if (command.command == "Remove") {
          Remove(this.controller + url, data).then(res => {
            if (this.serviceMessage(res, command.name + "完成。"))
              table.reload()
          })
          return
        }
        this.submitData(command.command + url, data, (res) => {
          if (this.serviceMessage(res, command.name + "完成。"))
            table.reload()
        })
      }
    }
    return table
  }
  initForm = () => {
    var form = {
      fields: null,
      model: true,
      visible:false,
      onChange: (fieldData, form) => {

      },
      onFormSubmit: (data, form, callback) => {
        const { command } = this.state
        if (command.command == "Create") {
          Create(this.controller, data).then(res => {
            if (callback)
              callback()
            this.serviceMessage(res, command.name + "完成。")
          })
        }
        if (command.command == "Update") {
          Update(this.controller, data.Id, data).then(res => {
            if (callback)
              callback()
            this.serviceMessage(res, command.name + "完成。")
          })
        }
      },
      onFormClear: (form) => {

      },
      onSearch: (value, textbox, fn, form) => {
        this.findDataSource(value, fn)
      }
    }
    return form
  }
  findDataSource = (item, callback) => {
    find(this.controller, item).then(res => {
      if (callback) {
        var cb = callback(res)
        if (cb !== false)
          this.serviceMessage(res)
      }
      else
        this.serviceMessage(res)
    });
  }
  submitData = (method, data, callback) => {
    Execute(this.controller, method, data).then(res => {
      if (callback)
        callback(res)
    })
  }
  serviceMessage = (res, mes) => {
    console.log(res)
    if (res.success) {
      if (mes != undefined)
        message.success(mes);
    }
    else {
      Modal.error({
        title: '出现错误！',
        content: res.message,
      });
    }
    return res.success
  }
  onInitTable = (table) => {
    if (this.props.onInitTable)
      table = this.props.onInitTable(table)
    return table
  }
  onInitForm = (form) => {
    if (this.props.onInitForm)
      form = this.props.onInitForm(form)
    return form
  }

  onTableRef = (ref) => {
    this.table = ref
  }
  onFormRef = (ref) => {
    this.form = ref
  }
  onTabChange = (index) => {
    this.setState({ tabindex: index }, () => {
      if (index == 0 && this.table)
        this.table.reload(this.editrow)
    })
  }

  render() {
    if (!this.state.success) return (<div />)
    const { table, form } = this.state
    const tablist = [
      { key: 0, tab: '显示' },
      { key: 1, tab: '操作' }
    ]
    console.log('waypage.render')
    return (
      <PageHeaderWrapper>
        <RouteContext.Consumer>
          {(value) => <>
            <WayTable title={value.title} {...table} parent={this} onRef={(ref) => { this.onTableRef(ref) }}></WayTable>
            <WayForm title={value.title} {...form} parent={this} onRef={(ref) => { this.onFormRef(ref) }} ></WayForm>
          </>}
        </RouteContext.Consumer>

      </PageHeaderWrapper >
    )
  }
  //组件挂载完成时候触发的生命周期函数04
  componentDidMount() {
    if (this.props.onRef)
      this.props.onRef(this)
  }
};


