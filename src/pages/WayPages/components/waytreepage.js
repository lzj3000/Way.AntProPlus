import React from 'react';
import { Tree, Input, Row, Col, Card, Modal, message, Space } from 'antd';
import { PageHeaderWrapper, RouteContext } from '@ant-design/pro-layout';
import WayFormTable from './wayformtable'
import { WayProSearch } from './waytoolbar'
import { view, find, Remove, Create, Update, Execute } from './service';

const { Search } = Input;


export default class WayTreePage extends React.Component {
  search = {
    findId: 0,
    pageindex: -1,
    pagesize: 10,
    foreignfield: '',
    detailname: '',
    fields: [],
    WhereList: [],//{name:'',value:null}
    OrderbyList: [],//{name:'',isdesc:false}
    ActionModel: null
  }
  controller = ''
  form = null
  node = null
  selectNode = null
  constructor(props) {
    super(props)
    this.state = {
      expandedKeys: [],
      selectedKeys: [],
      treeData: null,
      commands: null,
      form: null,
      success: false
    }
    this._getview(props)
  }
  renderView = () => {
    console.log('renderView')
    this.setState({ success: false }, () => {
      this._getview(this.props)
    });
  }
  _getview = (props) => {
    this.controller = props.controller
    view(this.controller).then(res => {
      if (res.success) {
        this.view = res.result
        var form = this.initForm()
        form.modelview = this.view.modelview
        form.name = this.view.modelview.name
        form.commands = this.view.commands
        this.state.istree = this._istree(this.view.modelview)
        this.setState({ form: form, success: true }, () => {
          if (this.state.istree) {
            this.getTreeData()
          }
        });
      }
    })
  }
  listTotree = (list) => {
    if (list == null) return
    var { foreign } = this.state
    var treelist = list.map((row) => {
      var t = {}
      t.key = row[foreign.oneObjecFiledKey]
      t.title = row[foreign.oneDisplayName]
      t.isLeaf = row.LevelId == null
      t.row = row
      if (row[foreign.manyObjectFiled] && row[foreign.manyObjectFiled].length > 0)
        t.children = this.listTotree(row[foreign.manyObjectFiled])
      return t
    })
    return treelist
  }
  _istree = (view) => {
    var field = view.childitem.find((field) => {
      if (field.foreign && field.foreign.isfkey && field.foreign.manyObjectName == field.foreign.oneObjectName && field.foreign.oneObjectName == view.name)
        return field
    })
    if (field == undefined || field == null)
      return false
    else {
      this.state.foreign = field.foreign
      return true
    }
  }
  initTree = () => {
    var tree = {
      showLine: true,
      autoExpandParent: false,
      expandedKeys: null,
      selectedKeys: null,
      treeData: null,
      onExpand: this.onExpand
    }
    return tree
  }
  initForm = () => {
    var form = {
      name: '',
      modelview: null,
      parent: this,
      type: 'view',
      onChange: (fieldData, form) => {

      },
      onCommandClick: (command, button, toolbar) => {
        this.state.command = command
        if (command.command == "Create" || command.command == "Update") {
          toolbar.setAllDisabled(true)
          return
        }
        var data = this.form.getObj()
        if (command.command == "Remove") {
          Remove(this.controller, data).then(res => {
            if (this.serviceMessage(res, command.name + "完成。"))
              this.getTreeData()
          })
          return
        }
        this.submitData(command.command, data, (res) => {
          if (this.serviceMessage(res, command.name + "完成。"))
            this.getTreeData()
        })
      },
      onFormSubmit: (data, form, callback) => {
        const { command } = this.state
        if (command.command == "Create") {
          Create(this.controller, data).then(res => {
            if (callback)
              callback()
            if (this.serviceMessage(res, command.name + "完成。")) {
              this.form.toolbar.setAllDisabled(false)
              this.form.toolbar.setSelectDisabled(0)
              this.getTreeData()
            }
          })
        }
        if (command.command == "Update") {
          Update(this.controller, data.Id, data).then(res => {
            if (callback)
              callback()
            if (this.serviceMessage(res, command.name + "完成。")) {
              this.form.toolbar.setAllDisabled(false)
              this.form.toolbar.setSelectDisabled(1)
              this.getTreeData()
            }
          })
        }
      },
      onClear: () => {
        if (this.state.command.command == "Create") {
          this.form.toolbar.setAllDisabled(false)
          this.form.toolbar.setSelectDisabled(0)
          this.form.clear()
        }
        if (this.state.command.command == "Update") {
          this.form.toolbar.setAllDisabled(false)
          this.form.toolbar.setSelectDisabled(1)
          this.form.setObj(this.form.row)
        }
      },
      onSearch: (value, textbox, fn, form) => {
        this.findDataSource(value, fn)
      },
      onRef: (ref) => {
        this.form = ref
      }
    }
    return form
  }

  onCommandClick = () => {

  }
  getTreeData = (node, ww, callback) => {
    var { foreign } = this.state
    this.node = node
    var where
    if (node == undefined)
      where = { name: foreign.manyObjectFiledKey, value: null }
    else
      where = { name: foreign.manyObjectFiledKey, value: node.key }
    this.search.WhereList = [where]
    if (ww) {
      this.search.WhereList = [ww]
    }
    this.findDataSource(this.search, (res) => {
      if (res.ok != undefined && !res.ok) {
        var mes = { success: false, message: res.statusText }
        this.serviceMessage(mes)
      }
      else {
        if (this.serviceMessage(res)) {
          var list = res.result.list
          var treelist = this.listTotree(list)
          if (this.node) {
            if (callback)
              callback(treelist)
          }
          else {
            this.setState({ treeData: treelist })
          }
        }
      }
      return false
    })
  }
  onExpand = (expandedKeys, e) => {
    if (e.expanded) {
      this.getTreeData(e.node, null, (list) => {
        if (list == null) return
        console.log(e.node)
        console.log(this.state.treeData)
        var node = this.findNode(e.node.key, this.state.treeData)
        console.log(node)
        node.children = list
        this.setState({ expandedKeys: expandedKeys, treeData: [...this.state.treeData] });
      })
    }
    else
      this.setState({ expandedKeys })

  };
  findNode = (key, list) => {
    if (!Array.isArray(list)) return
    var node = list.find((n) => n.key == key)
    if (node == undefined) {
      for (var i in list) {
        var n = list[i]
        if (n.children) {
          node = this.findNode(key, n.children)
          if (node != undefined)
            break
        }
      }
    }
    return node
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
    if (res.success) {
      if (mes != undefined)
        message.success(mes);
    }
    else {
      console.log(res)
      Modal.error({
        title: '出现错误！',
        content: res.message,
      });
    }
    return res.success
  }
  render() {
    if (!this.state.success) return <></>
    return (
      <PageHeaderWrapper>
        <Row gutter={[12, 4]}>
          <Col span={7}>
            <Card >
              <Space align={'start'} direction={'vertical'} size={16}>
                <WayProSearch fields={this.state.form.modelview.childitem} onSearch={(where) => {
                  this.getTreeData(null, where)
                }} />
                <Tree
                  showLine={true}
                  onExpand={this.onExpand}
                  expandedKeys={this.state.expandedKeys}
                  autoExpandParent={false}
                  treeData={this.state.treeData}
                  onSelect={(selectedKeys, e) => {
                    //e={selected: bool, selectedNodes, node, event}
                    if (this.form) {
                      this.form.setObj(e.node.row)
                      this.form.toolbar.setSelectDisabled(1)
                    }
                  }}
                />
              </Space>
            </Card>
          </Col>
          <Col span={17}>
            <WayFormTable {...this.state.form} ></WayFormTable>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
  //组件挂载完成时候触发的生命周期函数04
  componentDidMount() {
    if (this.props.onRef)
      this.props.onRef(this)
  }
}
