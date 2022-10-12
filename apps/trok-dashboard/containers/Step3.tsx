import React, { useCallback } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, NumberInput, Stack, Text } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCurrencyPound, IconFolders, IconUpload, IconX } from '@tabler/icons';

const Step3 = () => {
	const form = useForm({
		initialValues: {
			average_monthly_revenue: null
		}
	});
	const handleSubmit = useCallback(values => {
		alert(values);
	}, []);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col'>
			<h1 className='mb-4 text-2xl font-medium'>Your finances</h1>
			<Stack>
				<NumberInput
					required
					icon={<IconCurrencyPound size={16} />}
					label='What is your average monthly revenue?'
					placeholder='0'
					{...form.getInputProps('average_monthly_revenue')}
				/>
				<span>Get the best out of the credit limit by linking your business’s primary bank account</span>
				<div className='flex flex-row flex-col items-center justify-center space-y-4'>
					<Button px='xl' fullWidth>
						<Text weight='normal'>Link Business Bank Account</Text>
					</Button>
					<Text align='center' size='xs' color='dimmed'>
						Trok uses Plaid for a safe & secure connection
						<br />
						Recommended for instant approval
					</Text>
				</div>

				<span className="text-center">Can’t link your bank? Upload bank statements from the last three months.</span>
				<Dropzone
					onDrop={files => console.log('accepted files', files)}
					onReject={files => console.log('rejected files', files)}
					maxSize={3 * 1024 ** 2}
					accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
				>
					<Group position='center' spacing='xl' style={{ minHeight: 100, pointerEvents: 'none' }}>
						<Dropzone.Accept>
							<IconUpload size={50} stroke={1.5} />
						</Dropzone.Accept>
						<Dropzone.Reject>
							<IconX size={50} stroke={1.5} />
						</Dropzone.Reject>
						<Dropzone.Idle>
							<IconFolders size={40} stroke={1.5} />
						</Dropzone.Idle>
						<div>
							<Text size='xl' inline>
								Upload bank statements
							</Text>
							<Text size='xs' color='dimmed' mt={7} className='md:w-80'>
								PDF format required. Uploading bank statements may increase processing time for your
								application
							</Text>
						</div>
					</Group>
				</Dropzone>
				<Group mt='md' position="right">
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
					>
						<Text weight="normal">Continue</Text>
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step3;
