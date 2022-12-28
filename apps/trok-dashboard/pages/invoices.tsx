import React, { useCallback, useMemo, useState } from 'react';
import Page from '../layout/Page';
import { Button, Card, Loader, SimpleGrid, Space, Stack, Tabs } from '@mantine/core';
import { SectionState } from '../modals/InvoiceForm';
import InvoiceForm from '../modals/InvoiceForm';
import { useForm } from '@mantine/form';
import { GBP, TRANSACTION_STATUS } from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';
import { PATHS } from '../utils/constants';
import CardsTable from '../containers/CardsTable';

const Invoices = ({ testMode, session_id }) => {
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [invoiceOpened, setInvoiceOpened] = useState(false);
	const [section, setSection] = useState<SectionState>('create');
	const [loading, setLoading] = useState(false);

	const transactionsQuery = trpc.getTransactions.useQuery({ userId: session_id });

	const form = useForm({
		initialValues: {}
	});

	const handleSubmit = useCallback(async values => {
		console.log(values);
	}, []);

	const unpaid_approved_invoices = useMemo(() => {
		if (testMode) {
			return GBP(1256576).format();
		} else {
			return GBP(0).format();
		}
	}, [testMode]);

	const unpaid_unapproved_invoices = useMemo(() => {
		if (testMode) {
			return GBP(256576).format();
		} else {
			return GBP(0).format();
		}
	}, [testMode]);

	const unpaid_invoices = useMemo(() => {
		if (testMode) {
			return GBP(1256576 + 256576).format();
		} else {
			return GBP(0).format();
		}
	}, [testMode]);

	return (
		<Page.Container
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Invoices</span>
					<Button className='' onClick={() => setInvoiceOpened(true)}>
						<span className='text-base font-normal'>New Invoice</span>
					</Button>
				</Page.Header>
			}
		>
			<InvoiceForm
				opened={invoiceOpened}
				onClose={() => setInvoiceOpened(false)}
				form={form}
				onSubmit={handleSubmit}
				loading={loading}
				section={section}
				setSection={setSection}
			/>
			<Page.Body extraClassNames=''>
				<SimpleGrid cols={3} spacing='lg' breakpoints={[{ maxWidth: 600, cols: 1, spacing: 'sm' }]}>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='md' spacing="xs">
							<span className='text-base'>Unpaid Approved Invoices</span>
							{!testMode && transactionsQuery.isLoading ? (
								<Loader size='sm' />
							) : (
								<span className='heading-1'>
									{unpaid_approved_invoices.split('.')[0]}.
									<span className='text-base'>{unpaid_approved_invoices.split('.')[1]}</span>
								</span>
							)}
						</Stack>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='md' spacing="xs">
							<span className='text-base'>Unpaid Unapproved Invoices</span>
							{!testMode && transactionsQuery.isLoading ? (
								<Loader size='sm' />
							) : (
								<span className='heading-1'>
									{unpaid_unapproved_invoices.split('.')[0]}.
									<span className='text-base'>{unpaid_unapproved_invoices.split('.')[1]}</span>
								</span>
							)}
						</Stack>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='md' spacing="xs">
							<span className='text-base'>Unpaid Invoices</span>
							{!testMode && transactionsQuery.isLoading ? (
								<Loader size='sm' />
							) : (
								<span className='heading-1'>
									{unpaid_invoices.split('.')[0]}.
									<span className='text-base'>{unpaid_invoices.split('.')[1]}</span>
								</span>
							)}
						</Stack>
					</Card>
				</SimpleGrid>
				<Space py="lg" />
				<Tabs
					value={activeTab}
					onTabChange={setActiveTab}
					defaultValue='all'
					classNames={{
						root: 'flex flex-col grow',
						tabsList: '',
						tab: 'mx-4'
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='all'>All Invoices</Tabs.Tab>
						<Tabs.Tab value='awaiting'>Awaiting Payments</Tabs.Tab>
						<Tabs.Tab value='approval'>Needs Approval</Tabs.Tab>
						<Tabs.Tab value='paid'>Paid</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='all' className='h-full'>

					</Tabs.Panel>

					<Tabs.Panel value='awaiting' className='h-full'>

					</Tabs.Panel>
					<Tabs.Panel value='approval' className='h-full'>

					</Tabs.Panel>
					<Tabs.Panel value='paid' className='h-full'>

					</Tabs.Panel>
				</Tabs>
			</Page.Body>
		</Page.Container>
	);
};

export async function getServerSideProps({ req, res }) {
	const session = await unstable_getServerSession(req, res, authOptions);
	console.log(session);
	// check if the user is authenticated, it not, redirect back to login page
	if (!session) {
		return {
			redirect: {
				destination: PATHS.LOGIN,
				permanent: false
			}
		};
	}
	return {
		props: {
			session_id: session.id
		}
	};
}

export default Invoices;