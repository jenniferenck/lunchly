/** Routes for Lunchly */

const express = require('express');

const Customer = require('./models/customer');
const Reservation = require('./models/reservation');
const addEditCustomer = require('./route-helpers');

const router = new express.Router();

/** Homepage: show list of customers. */

router.get('/', async function(req, res, next) {
  try {
    const customers = await Customer.all();
    return res.render('customer_list.html', { customers });
  } catch (err) {
    return next(err);
  }
});

/** Search results: show list of customers. */

router.get('/search', async function(req, res, next) {
  try {
    const { firstName, lastName } = req.query;
    const customers = await Customer.getByName(firstName, lastName);
    return res.render('customer_list.html', { customers });
  } catch (err) {
    return next(err);
  }
});

/** Show list of top 10 customers. */

router.get('/top-ten', async function(req, res, next) {
  try {
    const customers = await Customer.getTopTen();
    return res.render('customer_list.html', { customers });
  } catch (err) {
    return next(err);
  }
});

/** Form to add a new customer. */

router.get('/add/', async function(req, res, next) {
  try {
    return res.render('customer_new_form.html');
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new customer. */

router.post('/add/', async function(req, res, next) {
  return await addEditCustomer(req, res, next);
});

/** Show a customer, given their ID. */

router.get('/:id/', async function(req, res, next) {
  try {
    req.customer = await Customer.get(req.params.id);

    return next();
  } catch (err) {
    return next(err);
  }
});

router.get('/:id/', async function(req, res, next) {
  try {
    const customer = req.customer;

    const reservations = await customer.getReservations();

    return res.render('customer_detail.html', { customer, reservations });
  } catch (err) {
    return next(err);
  }
});

/** Show form to edit a customer. */

router.get('/:id/edit/', async function(req, res, next) {
  try {
    const customer = req.customer;

    res.render('customer_edit_form.html', { customer });
  } catch (err) {
    return next(err);
  }
});

/** Handle editing a customer. */

router.post('/:id/edit/', async function(req, res, next) {
  return await addEditCustomer(req, res, next);
});

/** Handle adding a new reservation. */

router.post('/:id/add-reservation/', async function(req, res, next) {
  try {
    const customerId = req.params.id;
    const startAt = new Date(req.body.startAt);
    const numGuests = req.body.numGuests;
    const notes = req.body.notes;

    const reservation = new Reservation({
      customerId,
      startAt,
      numGuests,
      notes
    });
    await reservation.save();

    return res.redirect(`/${customerId}/`);
  } catch (err) {
    return next(err);
  }
});

router.post('/reservations/:r_id/edit', async function(req, res, next) {
  try {
    const reservationId = req.params.r_id;

    const reservation = Reservation.getReservation(reservationId);
    await reservation.save();

    return res.redirect(`/${reservation.customer_id}/`);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
