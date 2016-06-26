'use strict';
import fetch from 'isomorphic-fetch';
import Promise from 'bluebird';
import React from 'react';
import L from 'leaflet';
import classnames from 'classnames';
import _ from 'lodash';
import omnivore from 'leaflet-omnivore';
import Dropdown from '../components/dropdown';

const godiScores = 'http://index.okfn.org/api/entries.json';
const mapTopoJSON = '/assets/topojson/owners-wBlighted-target-only.json';
//const mapTopoJSON = 'https://raw.githubusercontent.com/open-contracting-partnership/ocp-data/publish/oc-status/_map.json';
const godiSlugs = 'http://index.okfn.org/api/places.json';

const viewFilterMatrix = {
  all: 'Everything',
  ocds: 'OCDS',
  commitments: 'OGP Relevant commitments',
  contracts: 'Publishing contracts'
};

const ocdsMatrix = {
  ocds_implementation: 'in implementation',
  ocds_historic_data: 'historic data',
  ocds_ongoing_data: 'ongoing data'
};

var MapWidget = React.createClass({
  displayName: 'MapWidget',

  mapCountryLayer: null,

  layerStyles: {
    default: {
      color: '#959595',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      fillColor: '#B5B5B5'
    },
    nodata: {
      color: '#E3E3E3',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      fillColor: '#F4F4F4'
    },
    hover: {
      color: '#C2DC16',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.5,
      fillColor: '#C2DC16'
    },
    active: {
      color: '#C2DC16',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      fillColor: '#C2DC16'
    },
    lilac: {
      color: '#6C75E1',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      fillColor: '#6C75E1'
    },
    orange: {
      color: '#FD843D',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      fillColor: '#FD843D'
    },
    teal: {
      color: '#23B2A7',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      fillColor: '#23B2A7'
    },
    darkorange: {
      color: '#FB6045',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      fillColor: '#FB6045'
    },
    blue: {
      color: '#6991F5',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      fillColor: '#6991F5'
    }
  },

  getInitialState: function () {
    return {
      fetchedData: false,
      fetchingData: false,
      mapTopoJSON: null,
      godiScores: null,
      godiData: null,
      godiPlaces: null,
      activeCountryProperties: null,
      viewFilter: 'all'
    };
  },

  fetchData: function () {
    this.setState({fetchingData: true});

    Promise.all([
      fetch(mapTopoJSON)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      }),

      fetch(godiScores)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      }),

      fetch(godiSlugs)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      })
    ])
    .then(data => {
      let countryData = data[0];
      let godiResults = data[1];
      let godiPlaceData = data[2];

      this.setState({
        fetchingData: false,
        fetchedData: true,
        mapTopoJSON: countryData,
        godiData: godiResults,
        godiPlaces: godiPlaceData
      });
      this.setupMap();
    });
  },

  componentDidMount: function () {
    this.fetchData();
  },

  componentDidUpdate: function () {
    if (this.mapCountryLayer) {
      this.setCountriesStyle();
    }
  },

  viewFilterClickHandler: function (key, e) {
    e.preventDefault();
    this.setState({ viewFilter: key });
  },

  closeClickHandler: function (e) {
    e.preventDefault();
    this.setState({ activeCountryProperties: null });
  },

  setCountriesStyle: function () {
    this.mapCountryLayer.eachLayer(this.setCountryStyle);
  },

  setCountryStyle: function (layer) {
    // Invalid.
    if (!layer.feature.properties.GGStatus) {
      layer.setStyle(this.layerStyles.active);
      return;
    }

    // Active layer.
    if (layer.feature.properties.GGStatus % 7 === 0 || layer.feature.properties.GGStatus === 12) {
      layer.setStyle(this.layerStyles.blue);
      return;
    }

    // Active layer.
    if (layer.feature.properties.GGStatus === 5) {
      layer.setStyle(this.layerStyles.teal);
      return;
    }

    // Default style.
    layer.setStyle(this.layerStyles.default);

    let lProps = layer.feature.properties;

    switch (this.state.viewFilter) {
      case 'ocds':
        if (_.find(lProps.publishers, {ocds_ongoing_data: true})) {
          layer.setStyle(this.layerStyles.lilac);
        } else if (_.find(lProps.publishers, {ocds_historic_data: true})) {
          layer.setStyle(this.layerStyles.orange);
        } else if (_.find(lProps.publishers, {ocds_implementation: true})) {
          layer.setStyle(this.layerStyles.teal);
        }
        break;
      case 'commitments':
        if (lProps.ogp_commitments && lProps.ogp_commitments.length) {
          layer.setStyle(this.layerStyles.darkorange);
        }
        break;
      case 'contracts':
        if (lProps.innovations && lProps.innovations.length) {
          layer.setStyle(this.layerStyles.blue);
        }
        break;
    }
  },

  onEachLayer: function (layer) {
    this.setCountryStyle(layer);

    layer
      .on('click', e => {
        if (!layer.feature.properties.has_data) {
          return;
        }
        this.setState({
          activeCountryProperties: e.target.feature.properties
        });
      })
      .on('mousemove', e => {
        if (!layer.feature.properties.has_data) {
          return;
        }
        // Don't act on the selected layer.
        if (e.target.feature.properties.iso_a2 !== _.get(this.state.activeCountryProperties, 'iso_a2', '')) {
          e.target.setStyle(this.layerStyles.hover);
        }
      })
      .on('mouseout', e => {
        if (!layer.feature.properties.has_data) {
          return;
        }
        // Don't act on the selected layer.
        if (e.target.feature.properties.iso_a2 !== _.get(this.state.activeCountryProperties, 'iso_a2', '')) {
          this.setCountryStyle(e.target);
        }
      });
  },

  setupMap: function () {
    var map = L.map(this.refs.mapHolder).setView([ 38.9072,-77.0369], 13);
    var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '<a href="https://www.mapzen.com/rights">Attribution.</a>. Data &copy;<a href="https://openstreetmap.org/copyright">OSM</a> contributors.'
    });


  	map.addLayer(layer);

    this.mapCountryLayer = omnivore.topojson.parse(this.state.mapTopoJSON)
      .eachLayer(this.onEachLayer)
      .addTo(map);

  },

  renderGodi: function (country) {
    let godi = this.state.godiData;
    let countryGodi = null;
    let godiPlaces = this.state.godiPlaces;
    let countryMeta = null;

    countryGodi = _.find(godi, {'place': country.iso_a2.toLowerCase(), 'dataset': 'procurement'});
    countryMeta = _.find(godiPlaces, {'id': country.iso_a2.toLowerCase()});

    if (!countryGodi || !countryMeta) {
      return;
    }
    return <p className='godi'>Transparency of Tenders & Awards: <a href={'http://index.okfn.org/place/' + countryMeta.slug} target='_blank'>{countryGodi.score}%</a></p>;
  },

  renderPublisher: function (publishers) {
    if (!publishers.length) {
      return <div><h3>Publishing open contracting data</h3><p>No entity publishing data yet</p></div>;
    }

    let content = _.map(publishers, (o, i) => {
      var status = [];
      _.forEach(ocdsMatrix, (str, idx) => {
        if (o[idx]) { status.push(str); }
      });
      var statusStr = status.join(', ');
      return (
        <li key={i}><a href={o.publisher_link} target='_blank'>{o.publisher}</a>:
          {statusStr ? <span> {statusStr}</span> : null}
        </li>
      );
    });
    return <div><h3>Publishing open contracting data</h3><ul>{content}</ul></div>;
  },

  renderInnovations: function (innovations) {
    if (!innovations.length) {
      return;
    }

    let content = _.map(innovations, (o, i) => {
      return (
        <li key={i}><a href={o.innovation_link} target='_blank'>{o.innovation_description}</a></li>
      );
    });

    return <div><h3>Innovations in contract monitoring and data use</h3><ul>{content}</ul></div>;
  },

  renderCommitments: function (country) {
    if (!(country.ogp_commitments.length) && (!(country.commitment_oil_mining) || country.commitment_oil_mining === 'none')) {
      return;
    }

    let content_ogp = _.map(country.ogp_commitments, (o, i) => {
      return (
        <li key={i}>OGP: <a href={o.ogp_commitment_link} target='_blank'>{o.ogp_commitment}</a></li>
      );
    });

    let content;
    if (country.commitment_oil_mining) {
      if (country.commitment_oil_mining) {
        content = <li>Oil and Mining: <a href={country.commitment_oil_mining_link} target='_blank'>{country.commitment_oil_mining}</a></li>;
      } else {
        content = <li>Oil and Mining: {country.commitment_oil_mining}</li>;
      }
    }

    return <div><h3>Commitments</h3><ul>{content_ogp}{content}</ul></div>;
  },

  render: function () {
    if (!this.state.fetchedData && !this.state.fetchingData) {
      return null;
    }

    let country = this.state.activeCountryProperties;

    return (
      <section className='ocp-map'>
        <header className='ocp-map__header'>
          <h1 className='ocp-map__title'>GGWash Vacant/Blight Map</h1>
          <div className='ocp-map__actions'>
            <span className='ocp-map__actions-description'>View by:</span>

            <Dropdown element='span' className='drop drop--down drop--align-left'
              triggerTitle='View map by'
              triggerText={viewFilterMatrix[this.state.viewFilter]}
              triggerClassName='drop__toggle'>

              <ul className='drop__menu drop__menu--select'>
                {_.map(viewFilterMatrix, (o, i) => {
                  return (
                    <li key={i}><a href=''
                      className={classnames('drop__menu-item', {'drop__menu-item--active': this.state.viewFilter === i})}
                      data-hook='dropdown:close'
                      onClick={this.viewFilterClickHandler.bind(null, i)}>{o}</a></li>
                  );
                })}
              </ul>
            </Dropdown>
          </div>
        </header>
        <div className='ocp-map__body'>
          <div className='ocp-map__map' ref='mapHolder'>{/* Map renders here */}</div>
        </div>
      </section>
    );
  }
});

module.exports = MapWidget;
