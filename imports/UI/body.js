import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tasks } from '../API/tasks.js';
import { ReactiveDict } from 'meteor/reactive-dict';

import './body.html';
import './task.js';


Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('tasks')
});

Template.body.helpers({
    tasks() {
        const instance = Template.instance();
        if (instance.state.get('hideCompleted')) {
            // If hide completed is checked, filter tasks
            return Tasks.find({ checked: { $ne: true } }, { sort: { priority: -1, createdTime: -1, _id: -1 } });
        }
        // Otherwise, return all of the tasks
        return Tasks.find({}, { sort: { priority: -1, createdTime: -1, _id: -1 } });
    },
    incompleteCount() {
        return Tasks.find({ checked: { $ne: true } }).count();
    },
    privateOrPublic() {
        return ["Public", "Private"];
    },
    getPriority() {
        return [0, 1, 2];
    },
});

Template.body.events({
    'submit .new-task'(event) {
        // Prevent default browser form submit
        event.preventDefault();
        // Get value from form element
        const target = event.target;
        const text = target.text.value;
        const privateOrPublic = target.privateOrPublic.value;
        const priority = target.priority.value;
        // Insert a task into the collection
        Meteor.call('tasks.insert', text, privateOrPublic, priority);
        // Clear form
        target.text.value = '';
    },
    'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
    },
});