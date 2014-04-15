/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 * and 2014 Massachusetts Institute of Technology
 * http://zerorobotics.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Loop blocks for Blockly. Modified for ZR C++ API.
 * @author fraser@google.com (Neil Fraser), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.Blocks.loops');

goog.require('Blockly.Blocks');

Blockly.Blocks['controls_repeat_ext'] = {
	// Repeat n times (external number).
	init: function() {
		this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
		this.setColour(120);
		this.interpolateMsg(Blockly.Msg.CONTROLS_REPEAT_TITLE,
												['TIMES', 'number', Blockly.ALIGN_RIGHT],
												Blockly.ALIGN_RIGHT);
		this.appendStatementInput('DO')
				.setCheck('statement');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setInputsInline(true);
		this.setTooltip(Blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['controls_whileUntil'] = {
	// Do while/until loop.
	init: function() {
		var OPERATORS =
				[['while', 'WHILE'],
				 ['until', 'UNTIL']];
		this.setHelpUrl(Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL);
		this.setColour(120);
		this.appendValueInput('BOOL')
				.appendField(new Blockly.FieldDropdown(OPERATORS), 'MODE')
				.setCheck('number');
		this.appendStatementInput('DO')
				.setCheck('statement');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		// Assign 'this' to a variable for use in the tooltip closure below.
		var thisBlock = this;
		this.setTooltip(function() {
			var op = thisBlock.getFieldValue('MODE');
			var TOOLTIPS = {
				WHILE: Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE,
				UNTIL: Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL
			};
			return TOOLTIPS[op];
		});
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['controls_for'] = {
	// For loop.
	init: function() {
		this.setHelpUrl(Blockly.Msg.CONTROLS_FOR_HELPURL);
		this.setColour(120);
		this.appendDummyInput()
				.appendField('for')
				.appendField('index1', 'VAR');
		this.interpolateMsg('from %1 to %2',
												['FROM', 'number', Blockly.ALIGN_RIGHT],
												['TO', 'number', Blockly.ALIGN_RIGHT],
												Blockly.ALIGN_RIGHT);
		this.appendStatementInput('DO')
				.setCheck('statement');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setInputsInline(true);
		// Assign 'this' to a variable for use in the tooltip closure below.
		var thisBlock = this;
		this.setTooltip(function() {
			return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
					thisBlock.getFieldValue('VAR'));
		});
		//Fire onchange handler when parent changes
		this.previousConnection.connect = function(otherConnection) {
			Blockly.Connection.prototype.connect.call(thisBlock.previousConnection, otherConnection);
			thisBlock.onchange();
		}
	},
	getVars: function() {
		return {
			type: 'int',
			name: this.getFieldValue('VAR'),
			isArray: 'FALSE',
		}
	},
	customContextMenu: function(options) {
		var option = {enabled: true};
		var name = this.getFieldValue('VAR');
		option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
		var xmlField = goog.dom.createDom('field', null, name);
		xmlField.setAttribute('name', 'VAR');
		var xmlBlock = goog.dom.createDom('block', null, xmlField);
		xmlBlock.setAttribute('type', 'variables_get');
		option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
		options.push(option);
	},
	onchange: function() {
		if (!this.workspace) {
			// Block has been deleted.
			return;
		}
		var depth = 0;
		// How many loops am I nested in?
		var block = this;
		do {
			if (block.type == 'controls_repeat_ext' ||
					block.type == 'controls_for' ||
					block.type == 'controls_whileUntil') {
				depth++;
			}
			block = block.getSurroundParent();
		} while (block);
		var newName = 'index' + depth;
		this.setFieldValue(newName, 'VAR');

		Blockly.Blocks.requireInFunction.call(this);
	}
};

Blockly.Blocks['controls_flow_statements'] = {
	// Flow statements: continue, break.
	init: function() {
		var OPERATORS =
				[[Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK, 'BREAK'],
				 [Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE, 'CONTINUE']];
		this.setHelpUrl(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_HELPURL);
		this.setColour(120);
		this.appendDummyInput()
				.appendField(new Blockly.FieldDropdown(OPERATORS), 'FLOW');
		this.setPreviousStatement(true, 'statement');
		// Assign 'this' to a variable for use in the tooltip closure below.
		var thisBlock = this;
		this.setTooltip(function() {
			var op = thisBlock.getFieldValue('FLOW');
			var TOOLTIPS = {
				BREAK: Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK,
				CONTINUE: Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE
			};
			return TOOLTIPS[op];
		});
	},
	onchange: function() {
		if (!this.workspace) {
			// Block has been deleted.
			return;
		}
		var legal = false;
		// Is the block nested in a control statement?
		var block = this;
		do {
			if (block.type == 'controls_repeat' ||
					block.type == 'controls_repeat_ext' ||
					block.type == 'controls_forEach' ||
					block.type == 'controls_for' ||
					block.type == 'controls_whileUntil') {
				legal = true;
				break;
			}
			block = block.getSurroundParent();
		} while (block);
		if (legal) {
			this.setWarningText(null);
		} else {
			this.setWarningText(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING);
		}
	}
};
