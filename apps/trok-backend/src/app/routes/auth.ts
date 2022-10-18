import * as express from 'express';
import prisma from '../db';
import redisClient from '../redis';
import { SignupInfo } from '@trok-app/shared-utils';
import { TWENTY_FOUR_HOURS } from '../utils/constants';
import { stripe } from '../utils/clients';

const router = express.Router();
let reminderTimeout;

router.post('/signup', async (req, res, next) => {
	try {
		const payload: SignupInfo = req.body;
		console.log(payload);
		await redisClient.hmset(payload.email, {
			'firstname': payload.firstname,
			'lastname': payload.lastname,
			'email': payload.email,
			'password': payload.password,
			'phone': payload.phone,
			'referral_code': payload.referral_code,
			'onboarding_step': 1
		})
		// set expiry time for 24hours
		await redisClient.expire(payload.email, 60 * 60 * 24 * 2);
		res.status(200).json({ message: `Signup for ${payload.email} has been initiated` });
	} catch (err) {
		console.error(err);
		next(err);
	}
});

router.post('/onboarding', async (req, res, next) => {
	try {
		const { email, step } = req.query;
		console.log('************************************************');
		console.log("EMAIL: " + email);
		const payload = req.body;
		console.log(payload);
		await redisClient.hset(<string>email, Object.entries(payload).flat());
		await redisClient.hset(<string>email, 'onboarding_step', <string>step)
		// reset expiry time for 24hours
		await redisClient.expire(<string>email, 60 * 60 * 24 * 2);
		res.status(200).json({ message: `${email} has completed onboarding step ${step}` });
		reminderTimeout = setTimeout(() => {
			//TODO - send reminder email
		}, TWENTY_FOUR_HOURS)
	} catch (err) {
		console.error(err);
		next(err);
	}
});

router.post('/complete-registration', async (req, res, next) => {
	try {
		const { accountToken, personToken, business_profile, data } = req.body;
		console.log('-----------------------------------------------');
		console.log(req.body)
		console.log('-----------------------------------------------');
		const account = await stripe.accounts.create({
			country: 'GB',
			type: 'custom',
			business_profile,
			capabilities: {
				card_payments: {requested: true},
				transfers: {requested: true}
				// card_issuing: {requested: true}
			},
			account_token: accountToken.id
		});
		console.log(account)
		const person = await stripe.accounts.createPerson(<string>account.id, {
			person_token: personToken.id
		});
		console.log('-----------------------------------------------');
		console.log(person)
		/*const user = await prisma.user.create({
			data: {
				email: data.email,
			}
		});
		console.log('USER', user);*/
		res.status(200).json({account, person})
	} catch (err) {
		console.error(err);
		next(err);
	}
})

router.post('/login', async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await prisma.user.findFirst({
			where: {
				email: {
					equals: email
				},
				password: {
					equals: password
				}
			}
		});
		if (user) {
			console.log(user);
			res.status(200).json(req.body);
		}
		throw new Error('User not found!');
	} catch (err) {
		console.error(err);
		next(err);
	}
});

export default router;
