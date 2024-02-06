/*
 * Copyright (c) 2020 Tano Systems. All Rights Reserved.
 * Author: Anton Kikin <a.kikin@tano-systems.com>
 */

'use strict';
'require baseclass';
'require rpc';
'require form';
'require lldpd';
'require dom';
'require poll';
'require network';
'require fs';
'require uci';



var callGetBuiltinEthernetPorts = rpc.declare({
	object: 'luci',
	method: 'getBuiltinEthernetPorts',
	expect: { result: [] }
});


var callNetworkStatus = rpc.declare({
	object: 'luci-rpc',
	method: 'getNetworkDevices',
	expect: {}
});

var callPoeStatus = rpc.declare({
	object: 'poe',
	method: 'info',
	expect: {}
});


var dataMap = {
	remote: {
		statistics: null,
	},
};

var portlist;
let portFlow = new Array();
let portPoeList = new Array();;

return L.view.extend({
	__init__: function() {
		this.super('__init__', arguments);

	
		this.tableStatistics = E('div', { 'class': 'table port-table' }, [
			E('div', { 'class': 'tr table-titles' }, [
				E('div', { 'class': 'th left top' }, _('Interface')),
				E('div', { 'class': 'th left top' }, _('State')),
				E('div', { 'class': 'th left top' }, _('Link')),
				E('div', { 'class': 'th left top' }, _('Speed/Duplex')),
				E('div', { 'class': 'th left top' }, _('Flow Control')),
				E('div', { 'class': 'th left top' }, _('PoE')),
				]),
			E('div', { 'class': 'tr center placeholder' }, [
				E('div', { 'class': 'td' }, E('em', { 'class': 'spinning' },
					_('Collecting data...'))),
			])
		]);

		// Inject CSS
		var head = document.getElementsByTagName('head')[0];
		var css = E('link', { 'href':
			L.resource('lldpd/lldpd.css')
				+ '?v=#PKG_VERSION', 'rel': 'stylesheet' });

		head.appendChild(css);
	},

	load: function() {
		return Promise.all([
			L.resolveDefault(callGetBuiltinEthernetPorts(), {}),
			uci.load('port')
		]);
	},






	/** @private */
	renderPort: function(port) {
		if (typeof port.port !== 'undefined')
		{
			if (typeof port.port[0].descr !== 'undefined' &&
			    typeof port.port[0].id[0].value !== 'undefined' &&
			    port.port[0].descr[0].value !== port.port[0].id[0].value)
			{
				return [
					E('strong', {}, port.port[0].descr[0].value),
					E('br', {}),
					port.port[0].id[0].value
				];
			}
			else
			{
				if (typeof port.port[0].descr !== 'undefined')
					return port.port[0].descr[0].value;
				else
					return port.port[0].id[0].value;
			}
		}
		else
		{
			return '%s'.format(port.name);
		}
	},

	/** @private */
	renderInterfaceState: function(status) {
		if ((typeof status === 'undefined') )
			return '&#8211;';

		if (status === 'enable')
			return _('Enable');
		else if (status === 'disable')
			return _('Disable');
		else
			return _('Unknown');
	},
	
	/** @private */
	renderInterfaceLink: function(link) {
		if ((typeof link === 'undefined') )
			return '&#8211;';

		if (link== true)
			return _('Up');
		else if (link == false)
			return _('Down');
		else
			return _('Unknown');
	},

	/** @private */
	renderInterfaceSpeed: function(speed) {
				
		if ((typeof speed === 'undefined'))
			return '&#8211;';

		if (speed.speed == 10 && speed.duplex === 'half')
			return _('10M Half Duplex ');
		if (speed.speed == 10 && speed.duplex === 'full')
			return _('10M Full Duplex ');
		if (speed.speed == 100 && speed.duplex === 'half')
			return _('100M Half Duplex ');
		if (speed.speed == 100 && speed.duplex === 'full')
			return _('100M Full Duplex ');
		if (speed.speed == 1000 && speed.duplex === 'full')
			return _('1000M Full Duplex ');
		else
			return '&#8211;';
	},
	
	/** @private */
	renderInterfaceFlow: function(flow) {
		if ((typeof flow === 'undefined'))
			return '&#8211;';

		return flow;		
	},
	
	/** @private */	
	renderInterfacePoE: function(poe) {
					
		if ((typeof poe === 'undefined'))
			return '&#8211;';
		
		if (poe.status === "Delivering power")
			return poe.status +' '+ poe.consumption + 'W';
		else
			return poe.status;
	},




	/** @private */
	generateRowId: function(str) {
		return str.replace(/[^a-z0-9]/gi, '-');
	},

	
	/** @private */
	makeTableRow: function(row) {
		//
		// row[0] - row id
		// row[1] - contents for first cell in row
		// row[2] - contents for second cell in row
		//   ...
		// row[N] - contents for N-th cell in row
		//
		
		var unfolded = 0;
		
		if (row.length < 2)
			return row;

		for (let i = 1; i < row.length; i++) {
			if (i == 1) {
				// Fold/unfold image appears only in first column
				var dImg = E('div', { 'style': 'padding: 0 8px 0 0;' }, [
					//E('img', { 'width': '16px', 'src': this.getFoldingImage(unfolded) }),
				]);
			}

			if (Array.isArray(row[i])) {
				// row[i][0] = folded contents
				// row[i][1] = unfolded contents

				// Folded cell data
				let dFolded   = E('div', {
					'class': 'lldpd-folded',
					'style': 'display: block;'
				}, row[i][0]);

			
				if (i == 1) {
					row[i] = E('div', {
						'style': 'display: flex; flex-wrap: nowrap;'
					}, [ dImg, dFolded ]);
				}
				else {
					row[i] = E('div', {}, [ dFolded]);
				}
			}
			else {
				// row[i] = same content for folded and unfolded states

				if (i == 1) {
					row[i] = E('div', {
						'style': 'display: flex; flex-wrap: nowrap;'
					}, [ dImg, E('div', row[i]) ]);
				}
			}
		}

		return row;
	},

	/** @private */
	getFlow: function(iface){		
		fs.exec('/usr/sbin/ethtool', ["--json", "-a", iface]).then(L.bind(function(data) {
			var elem = JSON.parse(data.stdout.trim());
		
			if(elem[0].rx == true && elem[0].tx == true)		
				portFlow[iface] = _('RX/TX');		
			if(elem[0].rx == true && elem[0].tx == false)		
				return "RX Only";
			if(elem[0].rx == false && elem[0].tx == true)		
				return "TX Only";
			if(elem[0].rx == false && elem[0].tx == false)		
				return "-";
		}, this));		
	},
	
	/** @private */
	getState: function(iface){		
		var state = uci.get('port', iface, 'state');
		return state;
	},



	/** @private */
	makeStatisticsTableRow: function(iface) {
		var row_id = this.generateRowId(iface.name);
		this.getFlow(iface.name);
		
		
			
		return this.makeTableRow([
			row_id,
			this.renderPort(iface),
			this.renderInterfaceState(this.getState(iface.name)),
			this.renderInterfaceLink(iface.up),			
			this.renderInterfaceSpeed(iface.link),
			this.renderInterfaceFlow(portFlow[iface.name]),			
			this.renderInterfacePoE(portPoeList[iface.name])		
		]);
	},

	/** @private */
	updateTable: function(table, data, placeholder) {
		var target = isElem(table) ? table : document.querySelector(table);

		if (!isElem(target))
			return;

		target.querySelectorAll(
			'.tr.table-titles, .cbi-section-table-titles').forEach(L.bind(function(thead) {
			var titles = [];

			thead.querySelectorAll('.th').forEach(function(th) {
				titles.push(th);
			});

			if (Array.isArray(data)) {
				var n = 0, rows = target.querySelectorAll('.tr');

				data.forEach(L.bind(function(row) {
					var id = row[0];
					var trow = E('div', { 'class': 'tr', 'click': L.bind(function(ev) {
						//this.handleToggleFoldingRow(ev.currentTarget, id);
						// lldpd_folding_toggle(ev.currentTarget, id);
					}, this) });

					for (var i = 0; i < titles.length; i++) {
						var text = (titles[i].innerText || '').trim();
						var td = trow.appendChild(E('div', {
							'class': titles[i].className,
							'data-title': (text !== '') ? text : null
						}, row[i + 1] || ''));

						td.classList.remove('th');
						td.classList.add('td');
					}

					trow.classList.add('cbi-rowstyle-%d'.format((n++ % 2) ? 2 : 1));

					if (rows[n])
						target.replaceChild(trow, rows[n]);
					else
						target.appendChild(trow);
				}, this));

				while (rows[++n])
					target.removeChild(rows[n]);

				if (placeholder && target.firstElementChild === target.lastElementChild) {
					var trow = target.appendChild(
						E('div', { 'class': 'tr placeholder' }));

					var td = trow.appendChild(
						E('div', { 'class': 'center ' + titles[0].className }, placeholder));

					td.classList.remove('th');
					td.classList.add('td');
				}
			} else {
				thead.parentNode.style.display = 'none';

				thead.parentNode.querySelectorAll('.tr, .cbi-section-table-row').forEach(function(trow) {
					if (trow !== thead) {
						var n = 0;
						trow.querySelectorAll('.th, .td').forEach(function(td) {
							if (n < titles.length) {
								var text = (titles[n++].innerText || '').trim();
								if (text !== '')
									td.setAttribute('data-title', text);
							}
						});
					}
				});

				thead.parentNode.style.display = '';
			}
		}, this));
	},

	/** @private */
	startPolling: function() {
		poll.add(L.bind(function() {
			return callGetBuiltinEthernetPorts().then(L.bind(function(data) {
				this.renderPortList(data);
			}, this));
		}, this),5);
		poll.add(L.bind(function() {
			return callNetworkStatus().then(L.bind(function(data) {
				this.renderData(data);
			}, this));
		}, this),5);
		
		poll.add(L.bind(function() {
			return callPoeStatus().then(L.bind(function(data) {
				this.makePoeList(data);
			}, this));
		}, this),5);
	},


	/** @private */
	renderDataStatistics: function(data) {
		var rows = [];

		if (data && typeof data !== 'undefined')
		{
			
			var ifaces = data;
			if (typeof  data !== 'undefined') {
				for (var i = 0; i < portlist.length; i++)
					rows.push(this.makeStatisticsTableRow(data[portlist[i].device]));
			}
		}

		return rows;
	},

	/** @private */
	renderData: function(data) {
		var r;

		r = this.renderDataStatistics(data);
		this.updateTable(this.tableStatistics, r,
			_('No data to display'));
	},
	
	/** @private */
	renderPortList: function(data) {
		portlist = data;
	},
		
		
	/** @private */
	makePoeList: function(data) {
		portPoeList = data.ports;		
	},
		

	render: function(data) {
		var m, s, ss, o;

		m = new form.JSONMap(dataMap,
			_('Port Status'),
			_('This page allows you to see port status information'));


		s = m.section(form.NamedSection, 'remote', 'remote');
		
		o = s.option(form.DummyValue, 'statistics');
		o.render = L.bind(function() {
			return E('div', { 'class': 'table-wrapper' }, [
				this.tableStatistics
			]);
		}, this);

		return m.render().then(L.bind(function(rendered) {
			this.startPolling();
			return rendered;
		}, this));
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
