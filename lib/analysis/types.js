const enotype = require('enotype');

exports.PRIORITIZED_TYPES = [
  { name: 'boolean', placeholder: 'true (e.g.)', loader: enotype.boolean },
  { name: 'integer', placeholder: '14 (e.g.)', loader: enotype.integer },
  { name: 'float', placeholder: '4.83 (e.g.)', loader: enotype.float },
  { name: 'date', placeholder: '2020-01-01 (e.g.)', loader: enotype.date },
  { name: 'datetime', placeholder: '1997-07-07T13:15:30Z (e.g.)', loader: enotype.datetime },
  { name: 'url', placeholder: 'https://eno-lang.org (e.g.)', loader: enotype.url },
  { name: 'email', placeholder: 'jane.doe@eno-lang.org (e.g.)', loader: enotype.email },
  { name: 'ipv4', placeholder: '192.168.62.27 (e.g.)', loader: enotype.ipv4 },
  { name: 'color', placeholder: '#fff (e.g.)', loader: enotype.color },
  { name: 'lat_lng', placeholder: '48.205870, 16.413690 (e.g.)', loader: enotype.latLng },
  { name: 'json', placeholder: '{ "key": "value" } (e.g.)', loader: enotype.json }
];

exports.STRING_TYPE = { name: 'string', placeholder: 'Lorem Ipsum (e.g.)', loader: value => value };
