'use strict';

const fs = require('hexo-fs');
const path = require('path');
const yaml = require('js-yaml');
const util = require('hexo-util');

hexo.extend.generator.register('assets', function () {
  return [
    {
      path: 'scripts/techradar.js',
      data: function () {
        return fs.createReadStream(path.resolve(__dirname, 'assets/techradar.js'))
      }
    },
    {
      path: 'css/techradar.css',
      data: function () {
        return fs.createReadStream(path.resolve(__dirname, 'assets/techradar.css'))
      }
    }
  ]
})

hexo.extend.tag.register('techradar', function (args, content) {
  const radar_config = yaml.safeLoad(content);
  if (!radar_config.container_id) {
    radar_config.container_id = 'hexo__techradar';
  }
  radar_config.entries = [];

  var no = 1;
  for (var quadrant of [2,3,1,0]) {
    radar_config.quadrants[quadrant].min_no = [99999, 99999, 99999, 99999];
    for (var ring = 0; ring < 4; ring++) {
      var entries = radar_config.quadrants[quadrant].entries.filter(item => item.ring == ring);
      radar_config.quadrants[quadrant].min_no[ring] = no;

      entries.sort(function(a,b) { return a.name.localeCompare(b.name); })
      for (var i=0; i<entries.length; i++) {
        entries[i].no = "" + no++;
        entries[i].quadrant = quadrant;
        radar_config.entries.push(entries[i]);
      }
    }
  }

  let html = '';
  html += '<div class="techradar" id="'+radar_config.container_id+'">\n';
  for (var quadrant of [2,3,1,0]) {
    html += '<div class="techradar__quadrant techradar__quadrant'+quadrant+'">';
    html += '<header class="techradar__quadrant-title">'+util.escapeHTML(radar_config.quadrants[quadrant].name)+'</header>';
    html += '<div class="techradar__quadrant-legend">';
    for (var ring = 0; ring < 4; ring++) {
      var entries = radar_config.quadrants[quadrant].entries.filter(item => item.ring == ring);
      html += '<div class="techradar__ring-legend">';
      html += '<header class="techradar__ring-title">'+util.escapeHTML(radar_config.rings[ring].name)+'</header>';
      html += '<ol class="techradar__ring-list" start="'+radar_config.quadrants[quadrant].min_no[ring]+'">';
      for (var entry of entries) {
        html += '<li data-no="'+entry.no+'">'+util.escapeHTML(entry.name)+'</li>';
      }
      html += '</ol>';
      html += '</div>';
    }
    html += '</div>';
    html += '<svg id="'+radar_config.container_id+quadrant+'" width="100%">';
    html += '</div>\n';
  }
  html += '<link rel="stylesheet" href="/css/techradar.css"/>\n';
  html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js"></script>\n';
  html += '<script src="/scripts/techradar.js"></script>\n';
  html += '<script>\n';
  html += 'var radar_config = '+JSON.stringify(radar_config)+';\n';
  for (var quadrant of [2,3,1,0]) {
  html += 'radar_visualization(Object.assign({}, radar_config, {'+
    'svg_id: radar_config.container_id+'+quadrant+', zoomed_quadrant: '+quadrant+
  '}));\n';
  }
  html += '</script>\n\n';

  html += '</div>';

  return html;

}, {ends: true});
