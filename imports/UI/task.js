import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './task.html';

Template.task.helpers({
    isOwner() {
        return this.owner === Meteor.userId();
    },
    getPriority() {
        return [0, 1, 2];
    },
});

Template.registerHelper('equals', (a, b) => a == b);


Template.task.events({
    'click .toggle-checked'() {
        // Set the checked property to the opposite of its current value
        Meteor.call('tasks.setChecked', this._id, !this.checked);
    },
    'click .delete'() {
        Meteor.call('tasks.remove', this._id);
    },
    'click .toggle-private'() {
        Meteor.call('tasks.setPrivate', this._id, !this.private);
    },
    'change #priority-select'(event) {
        const priority = $(event.currentTarget).val();
        Meteor.call('tasks.priority', this._id, priority);
    },
});