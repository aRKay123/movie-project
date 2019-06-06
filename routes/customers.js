const {Customer, validate} = require('../models/customer'); 
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({ 
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  });
  customer = await customer.save();
  
  res.send(customer);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(req.params.id,
    { 
      name: req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone
    }, { new: true });

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');
  
  res.send(customer);
});

router.delete('/:id', async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

router.route('/create-site-map')
    .post((req, res) => {
      const routes = req.body.routes.filter(x=>!x.includes('/admin/'))
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(x => `
  <url>
    <loc>${req.protocol}://${req.get('host')}${x}</loc>
  </url>`).join('')}
</urlset>
      `
      console.log(sitemap)
      fs.writeFile('public/sitemap.xml', sitemap, error => {
        //console.log('sitemap updated')
        if(error) console.log(error)
        res.json({error})
      })
    })


module.exports = router; 