import WayPage from '@/components/WayPage';
import React from 'react';

const WayPageIndex: React.FC = (props) => {
  console.log(props);
  return <WayPage controller={props.match.params.path} namespace={'transport'}></WayPage>;
};
export default WayPageIndex;
