import WayPage from '@/components/WayPage';
import { RouteContext } from '@ant-design/pro-layout';
import { Col, Image, Row } from 'antd';
import React, { useState } from 'react';

const WayPageIndex: React.FC = (props) => {
  return (<><RouteContext.Consumer>
    {
      (value) =>
      (<WayPage controller={props.match.params.path} title={value.title} namespace={'transport'}
        onExpandedRowTabPane={(childmodel, record) => {
          if (props.match.params.path != 'TranTask') return undefined
          if (record[childmodel.propertyname] && record[childmodel.propertyname].length > 0) {
            var items = record[childmodel.propertyname]
            return (<Row gutter={[8, 8]} justify={"center"}>
              {items.map((img) => {
                return (<Col span={24 / items.length}><Image width={100} height={100} src={img.imageurl} /></Col>)
              })}
            </Row>)
          }
        }}
      ></WayPage>)
    }

  </RouteContext.Consumer>

  </>);
};
export default WayPageIndex;
