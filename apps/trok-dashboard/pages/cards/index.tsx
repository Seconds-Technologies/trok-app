import React from 'react';
import PageContainer from '../../layout/PageContainer';
import { ActionIcon, Button, Group, Tabs } from '@mantine/core';
import CardsTable from '../../containers/CardsTable';
import { GBP, PATHS, SAMPLE_CARDS } from '../../utils/constants';
import { sanitize } from '../../utils/functions';
import classNames from 'classnames';
import { CARD_STATUS } from '../../utils/types';
import { IconChevronRight } from '@tabler/icons';
import { useRouter } from 'next/router';

const Cards = () => {
	const router = useRouter();
	const rows = SAMPLE_CARDS.map((element, index) => {
		const statusClass = classNames({
			'py-1': true,
			'w-28': true,
			rounded: true,
			'text-center': true,
			uppercase: true,
			'text-xs': true,
			'tracking-wide': true,
			'font-semibold': true,
			'text-success': element.status === CARD_STATUS.ACTIVE,
			'text-danger': element.status === CARD_STATUS.INACTIVE,
			'bg-success/25': element.status === CARD_STATUS.ACTIVE,
			'bg-danger/25': element.status === CARD_STATUS.INACTIVE
		});

		return (
			<tr
				key={index}
				style={{
					border: 'none'
				}}
			>
				<td colSpan={1}>
					<span>{element.last4}</span>
				</td>
				<td colSpan={1}>
					<div className={statusClass}>
						<span>{sanitize(element.status)}</span>
					</div>
				</td>
				<td colSpan={1}>
					<div className='flex flex-shrink flex-col'>
						<span>{element.cardholder_name}</span>
					</div>
				</td>
				<td colSpan={1}>
					<span>{GBP(element.balance).format()}</span>
				</td>
				<td colSpan={1}>
					<span>{GBP(element.spending_limit.weekly).format()}</span>
				</td>
				<td role="button" onClick={() => router.push(`${PATHS.CARDS}/${element.id}`)}>
					<Group grow position='left'>
						<ActionIcon size='sm'>
							<IconChevronRight />
						</ActionIcon>
					</Group>
				</td>
			</tr>
		);
	});

	return (
		<PageContainer
			header={
				<PageContainer.Header>
					<span className='text-2xl font-medium'>Cards</span>
					<Button className='' onClick={() => null}>
						<span className='text-base font-normal'>Add new card</span>
					</Button>
				</PageContainer.Header>
			}
		>
			<PageContainer.Body>
				<Tabs
					defaultValue='all'
					classNames={{
						root: 'flex flex-col grow',
						tabsList: '',
						tab: 'mx-4'
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='all'>All Cards</Tabs.Tab>
						<Tabs.Tab value='active'>Active</Tabs.Tab>
						<Tabs.Tab value='inactive'>Inactive</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='all' pt='xs' className="h-full">
						<CardsTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='active' pt='xs' className="h-full">
						<CardsTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='inactive' pt='xs' className="h-full">
						<CardsTable rows={rows} />
					</Tabs.Panel>
				</Tabs>
			</PageContainer.Body>
		</PageContainer>
	);
};

export default Cards;