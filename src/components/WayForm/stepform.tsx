import WayForm from '@/pages/WayPages/components/wayform';
import { Card, Divider, Steps } from 'antd';
import { StepProps } from 'antd/lib/steps';
import React, { useEffect, useState } from 'react';
import { ModelAttribute, WayFieldAttribute } from '../Attribute';
import DragModal from './window';

const { Step } = Steps;

interface WayStepFromProps {
    attr?: ModelAttribute
    title?: string,
    currentStep?: number,
    stepItem?: StepProps[],
    isCard?: boolean,
    isModal?: boolean,
    isShow?: boolean,
    onChange?: (current: number) => void;
    onCurrentStepComponent?: (current: number) => React.ReactDOM
    onShowChange?: (isshow: boolean) => void;
}

const WayStepFrom: React.FC<WayStepFromProps> = (props) => {
    const [currentStep, setCurrentStep] = useState<number>(props.currentStep ?? 0);
    const [isshow, setModalShow] = useState(props.isShow ?? false)
    useEffect(() => {
        setModalShow(props.isShow ?? false)
    }, [props.isShow])
    useEffect(() => {
        setCurrentStep(props.currentStep ?? 0)
    }, [props.currentStep])
    function getCurrentStepAndComponent(current: number) {
        if (props.onCurrentStepComponent)
            return props.onCurrentStepComponent(current)
        return (<WayForm attr={props.attr} ismodal={false}></WayForm>)
    }
    function renderSteps() {
        return (<><Steps current={currentStep} onChange={(current: number) => {
            setCurrentStep(current)
            if (props.onChange) {
                props.onChange(current)
            }
        }}>
            {props.stepItem?.map(item => {
                return (<Step {...item} />)
            })}
        </Steps>
        <Divider />
            {getCurrentStepAndComponent(currentStep)}
        </>)
    }
    function render() {
        if (props.isModal) {
            return (<DragModal title={props.title} width={900} visible={isshow} onCancel={() => setModalShow(false)} onOk={() => {

            }}>
                {renderSteps()}
            </DragModal>)
        }
        if (props.isCard)
            return (<Card title={props.title} bordered={false}>{renderSteps()}</Card>)
        return (renderSteps())
    }
    return (render())
}

export default WayStepFrom;