import React from 'react';
import { Button, Group, Modal, NumberInput, Radio, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export interface TaxRateFormValues {
	name: string;
	percentage: number;
	description?: string;
	calculation: "inclusive" | "exclusive";
}

interface NewTaxRateFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: TaxRateFormValues) => Promise<void>;
	loading: boolean;
}

const NewTaxRateForm = ({ opened, onClose, onSubmit, loading }: NewTaxRateFormProps) => {
	const form = useForm<TaxRateFormValues>({
		initialValues: {
			name: '',
			percentage: 0,
			description: '',
			calculation: 'inclusive'
		}
	});

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			padding='lg'
			size='lg'
			title='Add Tax'
			styles={{
				title: {
					fontSize: 24,
					fontWeight: 500
				},
				header: {
					paddingBottom: 8,
					borderBottom: '1px solid #E5E5E5'
				}
			}}
		>
			<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
				<Stack>
					<TextInput label='Name' required {...form.getInputProps('name')} />
					<NumberInput
						required
						withAsterisk
						label='Percent'
						precision={2}
						min={0}
						max={100}
						parser={value => value.replace(/%\s?|(,*)/g, '')}
						formatter={value =>
							!Number.isNaN(parseFloat(value)) ? `% ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '% '
						}
						{...form.getInputProps('percentage')}
					/>
					<Textarea label='Description' minRows={3} {...form.getInputProps('description')} />
					<Radio.Group
						required
						label='Tax Calculation'
						withAsterisk
						{...form.getInputProps('calculation')}
					>
						<Radio value='inclusive' label='Inclusive' />
						<Radio value='exclusive' label='Exclusive' />
					</Radio.Group>
				</Stack>
				<Group position='right'>
					<Button
						variant='outline'
						type='button'
						onClick={onClose}
						styles={{
							root: {
								width: 90
							}
						}}
					>
						<Text weight={500}>Cancel</Text>
					</Button>
					<Button
						disabled={!form.isDirty()}
						type='submit'
						loading={loading}
						styles={{
							root: {
								width: 90
							}
						}}
					>
						<Text weight={500}>Save</Text>
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default NewTaxRateForm;