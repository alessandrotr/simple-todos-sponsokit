import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId },
            ],
        });
    });
}

Meteor.methods({
    'tasks.insert'(text, privateOrPublic, getPriority) {
        check(text, String);
        // Make sure the user is logged in before inserting a task
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        let private = true;
        if (privateOrPublic == "Public") {
            private = false;
        }
        console.log(getPriority);
        Tasks.insert({
            text,
            createdDate: new Date().toLocaleDateString("en-US").replace(/-/gi, "/"),
            createdTime: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username,
            priority: getPriority,
            private: private,
        });
    },
    'tasks.remove'(taskId) {
        check(taskId, String);
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== this.userId) {
            // If the task is private, make sure only the owner can delete it
            alert("Only task owner can delete a task");
            throw new Meteor.Error('not-authorized');
        }
        Tasks.remove(taskId);
    },
    'tasks.setChecked'(taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== this.userId) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { checked: setChecked } });
    },
    'tasks.setPrivate'(taskId, setToPrivate) {
        check(taskId, String);
        check(setToPrivate, Boolean);
        const task = Tasks.findOne(taskId);
        // Make sure only the task owner can make a task private
        if (task.owner !== this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { private: setToPrivate } });
    },
    'tasks.priority'(taskId, priority) {
        check(taskId, String);
        check(priority, String);
        const task = Tasks.findOne(taskId);
        Tasks.update(taskId, { $set: { priority: priority } });
    },
});