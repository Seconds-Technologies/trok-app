import React, { useCallback, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import Image from 'next/image';
import { useLocalStorage } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { SignupSchema } from '../schemas';
import { PATHS, phoneUtil, STORAGE_KEYS } from '../utils/constants';
import { Button, Checkbox, Group, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { PhoneNumberFormat as PNF } from 'google-libphonenumber';
import { apiClient } from '../utils/clients';

export function Signup({ secret }) {
	const [newAccount, setNewAccount] = useLocalStorage({ key: STORAGE_KEYS.ACCOUNT, defaultValue: null });
	const [userForm, setUserForm] = useLocalStorage({
		key: STORAGE_KEYS.SIGNUP_FORM,
		defaultValue: {
			full_name: null,
			terms: undefined
		}
	});
	const router = useRouter();
	const form = useForm({
		initialValues: {
			...userForm
		},
		validate: zodResolver(SignupSchema)
	});

	const handleSubmit = useCallback(async values => {
		values.full_name = values.firstname + ' ' + values.lastname;
		const phone = phoneUtil.parseAndKeepRawInput(values.phone, 'GB');
		if (phoneUtil.getRegionCodeForNumber(phone) === 'GB') {
			const E164Number = phoneUtil.format(phone, PNF.E164);
			console.log('E164Number:', E164Number);
			values.phone = E164Number;
		}
		setNewAccount({ ...values, password: CryptoJS.AES.encrypt(JSON.stringify(values), secret).toString() });
		const result = (await apiClient.post('/server/auth/signup', values)).data;
		console.log('-----------------------------------------------');
		console.log(result);
		console.log('-----------------------------------------------');
		router.push(PATHS.ONBOARDING);
	}, [router, secret, setNewAccount]);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.SIGNUP_FORM);
		if (storedValue) {
			try {
				const parsedData = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.SIGNUP_FORM));
				form.setValues(parsedData);
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		// const decryptedData = JSON.parse(form.values.password.toString(CryptoJS.enc.Utf8));
		window.localStorage.setItem(STORAGE_KEYS.SIGNUP_FORM, JSON.stringify(form.values));
	}, [form.values]);

	return (
		<div className='h-screen w-full overflow-x-hidden bg-white p-5'>
			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className='flex h-full w-full flex-col'
				onError={() => console.log(form.errors)}
			>
				<Group position='apart' px='xl'>
					<header className='flex flex-row space-x-2'>
						<Image src='/static/images/logo.svg' width={30} height={30} />
						<span className='text-2xl font-medium'>Trok</span>
					</header>
					<Group spacing='xl'>
						<Text>Have an account?</Text>
						<Button px='xl' variant='outline' color='dark' onClick={() => router.push(PATHS.LOGIN)}>
							Sign in
						</Button>
					</Group>
				</Group>
				<Stack className='mx-auto my-auto w-1/3'>
					<header className='flex flex-col space-y-1'>
						<Title order={2}>Get started</Title>
						<span>Welcome to Trok— start saving on fuel in days.</span>
					</header>
					<Group grow spacing={40}>
						<TextInput
							withAsterisk
							label='Legal first name'
							{...form.getInputProps('firstname', { withError: true })}
						/>
						<TextInput
							withAsterisk
							label='Legal last name'
							{...form.getInputProps('lastname', { withError: true })}
						/>
					</Group>
					<TextInput
						withAsterisk
						label='Business email'
						{...form.getInputProps('email', { withError: true })}
					/>
					<TextInput
						withAsterisk
						label='Business phone number'
						{...form.getInputProps('phone', { withError: true })}
					/>
					<PasswordInput
						withAsterisk
						label='Password'
						{...form.getInputProps('password', { withError: true })}
					/>
					<TextInput label='Referral code' {...form.getInputProps('referral_code')} />
					<Checkbox
						label='By checking this box, I acknowledge and agree to the terms of the Trok Terms of Service on behalf of the Company identified above, that I am authorised to do so on behalf of the Company, and that I have reviewed the terms of the Trok Privacy Policy.'
						checked={form.values.terms}
						size='xs'
						{...form.getInputProps('terms', { type: 'checkbox', withError: true })}
					/>
					<Group mt='md' position='right'>
						<Button
							type='submit'
							variant='filled'
							size='md'
							style={{
								width: 200
							}}
						>
							<Text weight={500}>Sign up</Text>
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
}

export const getServerSideProps = context => {
	return {
		props: {
			secret: process.env.ENC_SECRET
		}
	};
};

export default Signup;
