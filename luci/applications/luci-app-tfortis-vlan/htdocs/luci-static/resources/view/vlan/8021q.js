'use strict';
'require view';
'require dom';
'require poll';
'require fs';
'require ui';
'require uci';
'require form';
'require network';
'require firewall';
'require tools.widgets as widgets';
'require tools.network as nettools';


var cbiTagValue = form.Value.extend({
	renderWidget: function(section_id, option_index, cfgvalue) {
		var widget = new ui.Dropdown(cfgvalue || ['-'], {
			'-': E([], [
				E('span', { 'class': 'hide-open', 'style': 'font-family:monospace' }, [ '—' ]),
				E('span', { 'class': 'hide-close' }, [ _('Not Member', 'VLAN port state') ])
			]),
			'u': E([], [
				E('span', { 'class': 'hide-open', 'style': 'font-family:monospace' }, [ 'U' ]),
				E('span', { 'class': 'hide-close' }, [ _('Untagged', 'VLAN port state') ])
			]),
			't': E([], [
				E('span', { 'class': 'hide-open', 'style': 'font-family:monospace' }, [ 'T' ]),
				E('span', { 'class': 'hide-close' }, [ _('Tagged', 'VLAN port state') ])
			]),
			'*': E([], [
				E('span', { 'class': 'hide-open', 'style': 'font-family:monospace' }, [ '*' ]),
				E('span', { 'class': 'hide-close' }, [ _('Is Primary VLAN', 'VLAN port state') ])
			])
		}, {
			id: this.cbid(section_id),
			sort: [ '-', 'u', 't', '*' ],
			optional: false,
			multiple: true,
			validate: L.bind(this.validate, this, section_id, option_index)
		});

		var field = this;

		widget.toggleItem = function(sb, li, force_state) {
			var lis = li.parentNode.querySelectorAll('li'),
			    toggle = ui.Dropdown.prototype.toggleItem;

			toggle.apply(this, [sb, li, force_state]);

			if (force_state != null)
				return;

			switch (li.getAttribute('data-value'))
			{
			case '-':
				if (li.hasAttribute('selected')) {
					for (var i = 0; i < lis.length; i++) {
						switch (lis[i].getAttribute('data-value')) {
						case '-':
							break;

						case '*':
							toggle.apply(this, [sb, lis[i], false]);
							lis[i].setAttribute('unselectable', '');
							break;

						default:
							toggle.apply(this, [sb, lis[i], false]);
						}
					}
				}
				break;

			case 't':
			case 'u':
				if (li.hasAttribute('selected')) {
					for (var i = 0; i < lis.length; i++) {
						switch (lis[i].getAttribute('data-value')) {
						case li.getAttribute('data-value'):
							break;

						case '*':
							lis[i].removeAttribute('unselectable');
							break;

						default:
							toggle.apply(this, [sb, lis[i], false]);
						}
					}
				}
				else {
					toggle.apply(this, [sb, li, true]);
				}
				break;

			case '*':
				if (li.hasAttribute('selected')) {
					var section_ids = field.section.cfgsections();

					for (var i = 0; i < section_ids.length; i++) {
						var other_widget = field.getUIElement(section_ids[i]),
						    other_value = L.toArray(other_widget.getValue());

						if (other_widget === this)
							continue;

						var new_value = other_value.filter(function(v) { return v != '*' });

						if (new_value.length == other_value.length)
							continue;

						other_widget.setValue(new_value);
						break;
					}
				}
			}
		};

		var node = widget.render();

		node.style.minWidth = '4em';

		if (cfgvalue == '-')
			node.querySelector('li[data-value="*"]').setAttribute('unselectable', '');

		return E('div', { 'style': 'display:inline-block' }, node);
	},
	
	cfgvalue: function(section_id) {
		var ports = L.toArray(uci.get('network', section_id, 'ports'));

		for (var i = 0; i < ports.length; i++) {
			var s = ports[i].split(/:/);

			if (s[0] != this.port)
				continue;

			var t = /t/.test(s[1] || '') ? 't' : 'u';

			return /\x2a/.test(s[1] || '') ? [t, '*'] : [t];
		}

		return ['-'];
	},

	write: function(section_id, value) {
		var ports = [];

		for (var i = 0; i < this.section.children.length; i++) {
			var opt = this.section.children[i];

			if (opt.port) {
				var val = L.toArray(opt.formvalue(section_id)).join('');

				switch (val) {
				case '-':
					break;

				case 'u':
					ports.push(opt.port);
					break;

				default:
					ports.push('%s:%s'.format(opt.port, val));
					break;
				}
			}
		}

		//проверяем, что нетегированный порт не встречается в других VLAN
		var section_ids = this.section.cfgsections();	
		var changed_ports = L.toArray(ports);		
		for (var i = 0; i < section_ids.length; i++) {
			if(section_ids[i] != section_id){
				var other_ports = L.toArray(uci.get('network', section_ids[i], 'ports'));
				for (var j = 0; j < changed_ports.length; j++) { //проходимся по первому масиву
				  for (var k = 0; k< other_ports.length; k++) { // ищем соотвествия во втором массиве
					if(changed_ports[j] === other_ports[k] && (changed_ports[j].indexOf(':t')<=0) ){						
						ui.addNotification(null, E('p', _('Untagged port '+changed_ports[j]+' is present in other VLAN')), 'danger');
						return false;
					}
				  }
				}					
			}					
		}
			
		uci.set('network', section_id, 'ports', ports.length ? ports : null);
	},
	validate: function(section_id, value,option_index) {
		return true;
	},
	remove: function() {}
});

return view.extend({
	
	load: function() {
		return Promise.all([			
			network.getDevice('switch'),
			uci.load('network'),
			network.getDevices()		
		]);
	},
	
	render: function(data) {
		var  m, s, o;
		var ports = data[0].getPorts();
		var interfaces = uci.sections('network', 'interface');
		var devices = uci.sections('network', 'device');
				
		m = new form.Map('network', _('802.1Q VLAN Settings'),	_('Configuration of VLAN'));

		s = m.section(form.GridSection, 'interface', _('Managment VLAN'));
		s.anonymous = false;
		s.load = function() {
			return Promise.all([
				network.getNetworks()	
			]).then(L.bind(function(data) {
				this.networks = data[0];			
			}, this));
		};
		s.cfgsections = function() {
			return this.networks.map(function(n) { return n.getName() })
				.filter(function(n) { return n != 'loopback' });
		};	
		
		o = s.option(form.Value, 'vlan', _('VLAN ID'));
		o.datatype = 'range(1, 4094)';
		o.editable = true;
		o.optional = true;
		o.width = 10;
		o.cfgvalue = function(section_id) {							
			for(var i = 0; i<devices.length; i++){
				if(devices[i].type == '8021q' ){
					for(var k = 0; k<interfaces.length; k++){
						if(interfaces[k].device == devices[i].name)
							return devices[i].vid;
					}
				}				
			}			
		};
		o.write = function(section_id,value) {
			for(var i = 0; i<devices.length; i++){
				if(devices[i].type == '8021q' ){
					for(var k = 0; k<interfaces.length; k++){
						if(interfaces[k].device == devices[i].name){
							uci.set('network',devices[i]['.name'], 'vid', value);			
						}
					}
				}				
			}	
			
		}
		
			
		s = m.section(form.GridSection, 'bridge-vlan', _('VLAN List'));
		s.anonymous = true;
		s.tab('settings', _('Settings'));		
		s.handleAdd = function(ev) {
			var  max_vlan_id = 0;
			var section_id = null;
			var section_ids = this.cfgsections();
					
			var sections = uci.sections('network', 'device');
			var device = sections[0].name;
								
			for (var i = 0; i < section_ids.length; i++) {
				var vid = +uci.get('network', section_ids[i], 'vlan');
				if (vid > max_vlan_id)
					max_vlan_id = vid;
			}
				
			section_id = uci.add('network', 'bridge-vlan');
			uci.set('network', section_id, 'device', device);									
			return this.map.save(null, true);
		};	

		o = s.taboption('settings', form.Value, 'vlan', _('VLAN ID'));
		o.datatype = 'range(1, 4094)';
		o.editable = true;
		o.validate = function(section_id, value) {
			var section_ids = this.section.cfgsections();

			for (var i = 0; i < section_ids.length; i++) {
				if (section_ids[i] == section_id)
					continue;

				if (uci.get('network', section_ids[i], 'vlan') == value)
					return _('The VLAN ID must be unique');
			}
			return true;
		};
		
		o = s.taboption('settings',form.ListValue, 'state', 'State');
		o.value('enable','enable');
		o.value('disable','disable');	
		o.editable = true;

		
		o = s.taboption('settings', form.Value, 'descr', _('Description'));
		o.editable = true;
	
	
		for (var i = 0; i < ports.length; i++) {
			o[i] = s.taboption('settings',cbiTagValue, ports[i].device,ports[i].device );
			o[i].port = ports[i].device;
			o[i].editable = true;			
		}	

		s.addremove = true;	
		return m.render();
	}
});
