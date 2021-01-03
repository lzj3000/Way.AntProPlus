import WayPage from '@/components/WayPage';
import React from 'react';

const WayPageIndex: React.FC = (props) => {
  console.log(props);
  return <WayPage controller={props.match.params.path}></WayPage>;
};
export default WayPageIndex;
