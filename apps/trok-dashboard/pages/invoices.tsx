import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Page from '../layout/Page';
import { Button, Card, Loader, SimpleGrid, Space, Stack, Tabs } from '@mantine/core';
import InvoiceForm from '../modals/invoices/InvoiceForm';
import { useForm } from '@mantine/form';
import { GBP } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { PATHS, SAMPLE_INVOICES, STORAGE_KEYS } from '../utils/constants';
import InvoiceTable from '../containers/InvoiceTable';
import PODUploadForm from '../modals/invoices/PODUploadForm';
import InvoiceUploadForm from '../modals/invoices/InvoiceUploadForm';
import { InvoiceFormValues } from '../utils/types';

const Invoices = ({ testMode, session_id, invoice_id }) => {
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [podOpened, setPODOpened] = useState(false);
	const [invUploadOpened, setInvUploadOpened] = useState(false);
	const [invoiceOpened, setInvoiceOpened] = useState(false);
	const [loading, setLoading] = useState(false);

	const invoicesQuery = trpc.invoice.getInvoices.useQuery({ userId: session_id });

	const data = testMode ? SAMPLE_INVOICES : invoicesQuery.data ? invoicesQuery.data.filter(i => !i.deleted) : [];

	const form = useForm<InvoiceFormValues>({
		initialValues: {
			// indicator on whether the invoice was created using the form or was uploaded by the user
			type: 'create',
			// represents the invoice_id of a created / uploaded invoice
			invoice_id: null,
			// stores the storage url of proof of delivery of photo(s)
			pod: null,
			// represents the current invoice object stored in the backend,
			invoice: null,
			// indicates that the user clicked the "New Invoice" button and is not expanding an existing invoice
			new: true
		}
	});

	/*
	 * TODO - Omar ignore this handler, this handler will be for sending a notification to the team that a new invoice
	 *  has been submitted (for uploaded and created invoices). The one you have to complete is inside the InvoiceUploadForm.tsx file
	 */
	const handleSubmit = useCallback(async values => {
		console.log(values)
	}, []);

	const unpaid_approved_invoices = useMemo(() => {
		if (testMode) {
			return GBP(1256576).format();
		} else {
			const sum = invoicesQuery.data?.reduce((prev, curr) => {
				if (curr.paid_status === "unpaid" && curr.approved) {
					return prev + curr.amount_due
				} else {
					return prev
				}
			}, 0)
			return GBP(sum).format();
		}
	}, [invoicesQuery.data, testMode]);

	const unpaid_unapproved_invoices = useMemo(() => {
		if (testMode) {
			return GBP(256576).format();
		} else {
			const sum = invoicesQuery.data?.reduce((prev, curr) => {
				if (curr.paid_status === "unpaid" && !curr.approved) {
					return prev + curr.amount_due
				} else {
					return prev
				}
			}, 0)
			return GBP(sum).format();
		}
	}, [invoicesQuery.data, testMode]);

	const unpaid_invoices = useMemo(() => {
		if (testMode) {
			return GBP(1256576 + 256576).format();
		} else {
			const sum = invoicesQuery.data?.reduce((prev, curr) => {
				if (curr.paid_status === "unpaid") {
					return prev + curr.amount_due
				} else {
					return prev
				}
			}, 0)
			return GBP(sum).format();
		}
	}, [invoicesQuery.data, testMode]);

	/**
	 * On page mount, grab existing values in local storage and update invoice form
	 */
	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.INVOICE_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.INVOICE_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
			}
		}
	}, []);

	/**
	 * Sync Form changes with local storage form
	 */
	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.INVOICE_FORM, JSON.stringify(form.values));
	}, [form.values]);

	/**
	 * "Auto-opens" the invoice form after user has created a fresh new invoice from the create-invoice page
	 */
	useEffect(() => {
		if (form.values.new && form.values.invoice_id) setInvoiceOpened(true);
	}, [form.values.invoice_id, form.values.new]);

	return (
		<Page.Container
			extraClassNames=''
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Invoices</span>
					<Button className='' onClick={() => {
						form.reset()
						setInvoiceOpened(true)
					}}>
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
				showPODUploadForm={() => {
					setInvoiceOpened(false);
					setTimeout(() => setPODOpened(true), 100);
				}}
				showInvUploadForm={() => {
					setInvoiceOpened(false);
					setTimeout(() => setInvUploadOpened(true), 100);
				}}
			/>
			<PODUploadForm
				opened={podOpened}
				onClose={() => setPODOpened(false)}
				goBack={() => {
					setPODOpened(false);
					setTimeout(() => setInvoiceOpened(true), 100);
				}}
				form={form}
			/>
			<InvoiceUploadForm
				opened={invUploadOpened}
				onClose={() => setInvUploadOpened(false)}
				form={form}
				loading={loading}
				goBack={() => {
					setInvUploadOpened(false);
					setTimeout(() => setInvoiceOpened(true), 100);
				}}
			/>
			<Page.Body>
				<SimpleGrid cols={3} spacing='lg' breakpoints={[{ maxWidth: 600, cols: 1, spacing: 'sm' }]}>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='md' spacing='xs'>
							<span className='text-base'>Unpaid Approved Invoices</span>
							{!testMode && invoicesQuery.isLoading ? (
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
						<Stack px='md' py='md' spacing='xs'>
							<span className='text-base'>Unpaid Unapproved Invoices</span>
							{!testMode && invoicesQuery.isLoading ? (
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
						<Stack px='md' py='md' spacing='xs'>
							<span className='text-base'>Unpaid Invoices</span>
							{!testMode && invoicesQuery.isLoading ? (
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
				<Space py='md' />
				<div className='h-full flex flex-col'>
					<Tabs
						value={activeTab}
						orientation='horizontal'
						onTabChange={setActiveTab}
						defaultValue='all'
						classNames={{
							root: 'grow',
							tabsList: '',
							tab: 'mx-4',
							panel: ''
						}}
					>
						<Tabs.List>
							<Tabs.Tab value='all'>All Invoices</Tabs.Tab>
							<Tabs.Tab value='approval'>Needs Approval</Tabs.Tab>
							<Tabs.Tab value='awaiting'>Awaiting Payments</Tabs.Tab>
							<Tabs.Tab value='paid'>Paid</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='all'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								form={form}
								loading={loading}
								setOpened={setInvoiceOpened}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='approval'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								form={form}
								loading={loading}
								setOpened={setInvoiceOpened}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='awaiting'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								form={form}
								loading={loading}
								setOpened={setInvoiceOpened}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='paid'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								form={form}
								loading={loading}
								setOpened={setInvoiceOpened}
							/>
						</Tabs.Panel>
					</Tabs>
				</div>
			</Page.Body>
		</Page.Container>
	);
};

export async function getServerSideProps({ req, res, query }) {
	const session = await unstable_getServerSession(req, res, authOptions);
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
			session_id: session.id,
			invoice_id: query['invoice-id'] ?? ""
		}
	};
}

export default Invoices;
