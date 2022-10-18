import React, { useCallback, useMemo } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { ScrollArea, Text, Stepper } from '@mantine/core';
import Step1 from '../containers/signup/Step1';
import Step2 from '../containers/signup/Step2';
import Step3 from '../containers/signup/Step3';
import SignUpComplete from '../containers/signup/SignUpComplete';
import { useLocalStorage } from '@mantine/hooks';
import { PATHS, STORAGE_KEYS } from '../utils/constants';
import { useRouter } from 'next/router';

const Onboarding = ({ auth, setAuth }) => {
	const router = useRouter();
	const [complete, setComplete] = useLocalStorage({ key: STORAGE_KEYS.COMPLETE, defaultValue: false });
	const { height } = useWindowSize();

	const active = useMemo(() => {
		return isNaN(Number(router.query.page)) ? 0 : Number(router.query.page) - 1;
	}, [router.query.page])

	const nextStep = useCallback(() => {
		router.replace({
			pathname: PATHS.ONBOARDING,
			query: {
				page: active + 2
			}
		});
	}, [active, router])

	const prevStep = () => {
		router.replace({
			pathname: PATHS.ONBOARDING,
			query: {
				page: active
			}
		});
	}

	return (
		<ScrollArea.Autosize maxHeight={height} mx='auto'>
			{!complete ? (
				<div className='flex min-h-screen flex-col justify-center bg-white p-5'>
					<Text mb='md' size='lg' className='text-center'>
						Step {active + 1} of 3
					</Text>
					<Stepper
						iconSize={25}
						completedIcon={<div className='bg-white' />}
						active={active}
						size='xs'
						styles={{
							stepBody: {
								display: 'none'
							},
							step: {
								padding: 0
							},
							stepIcon: {
								// border: '2px solid #D0D7DE',
								borderWidth: 2
							},
							separator: {
								marginLeft: -2,
								marginRight: -2
								// background:	'repeating-linear-gradient(to right,lightgray 0,lightgray 10px,transparent 10px,transparent 12px)'
							}
						}}
						classNames={{
							root: 'flex flex-col items-center',
							steps: 'w-1/3 px-20',
							content: 'w-1/3 h-full'
						}}
					>
						<Stepper.Step
							icon={<div />}
							label='First step'
							description='Create an account'
							allowStepSelect={active > 0}
						>
							<Step1 nextStep={nextStep} />
						</Stepper.Step>
						<Stepper.Step
							icon={<div />}
							label='Second step'
							description='Financial'
							allowStepSelect={active > 1}
						>
							<Step2 prevStep={prevStep} nextStep={nextStep} />
						</Stepper.Step>
						<Stepper.Step
							icon={<div />}
							label='Final step'
							description='Location'
							allowStepSelect={active > 2}
						>
							<Step3 prevStep={prevStep} finish={setComplete} />
						</Stepper.Step>
					</Stepper>
				</div>
			) : (
				<SignUpComplete auth={auth} setAuth={setAuth} />
			)}
		</ScrollArea.Autosize>
	);
};

export default Onboarding;
