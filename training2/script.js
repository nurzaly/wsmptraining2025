const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderTasks() {
    const statuses = ['backlog', 'in-progress', 'done'];

    statuses.forEach(status => {
        const column = $('#' + status + ' .task-list');
        column.empty();

        const filtered = tasks.filter(t => t.status === status);

        filtered.sort((a, b) => a.sortOrder - b.sortOrder).forEach(
            task => {
                const isDone = task.status === 'done';
                const inProgess = task.status === 'in-progress';
                const taskHTML = `
                <div class="task" data-id="${task.id}">
                    <div class="task-content">
                        <span>ID:${task.id}</span>
                        <span>Description:${task.description}</span>
                        ${task.responsible ? `<span>Responsible:${task.responsible}</span>` : ''} 
                        ${task.startTime ? `<span>Start Time:${task.startTime}</span>` : ''}
                        ${task.endTime ? `<span>End Time:${task.endTime}</span>` : ''}
                        <span>Status:</span>
                    </div>
                    <div class="task-action">
                        <button>Edit</button>
                        <button>Delete</button>
                    </div>
                </div>
                `
                column.append(taskHTML);

                $('#' + status + ' .count').text(filtered.length);
            }
        );

    });
}


function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

$('#taskForm').submit(function (e) {
    e.preventDefault();
    const desc = $('#taskDescription').val().trim();
    // const id = $('#taskId').val().trim();
    if (!desc) return alert('Description required')
    const newTask = {
        id: crypto.randomUUID(),
        description: desc,
        status: 'backlog',
        sortOrder: tasks.length
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
});

$(function () {


    $('.task-list').sortable({
        connectWith: '.task-list',
        placeholder: 'task-placeholder',
        over: function (event, ui) {
            const id = ui.item.data('id');
            const task = tasks.find(t => t.id == id);
            const newStatus = $(this).closest('.column').attr('id');
            const oldStatus = task?.status;
            const validMove =
                (oldStatus === 'backlog' && newStatus === 'in-progress') ||
                (oldStatus === 'in-progress' && newStatus === 'done') ||
                (oldStatus === newStatus);
            $(this).removeClass('drag-valid drag-invalid')
                .addClass(validMove ? 'drag-valid' : 'drag-invalid');
        },
        out: function (event, ui) {
            $(this).removeClass('drag-valid drag-invalid');
        },
        receive: function (event, ui) {
            const id = ui.item.data('id');
            const newStatus = $(this).closest('.column').attr('id');
            const task = tasks.find(t => t.id == id);
            const oldStatus = task.status;

            $(this).removeClass('drag-valid drag-invalid');

            const validMove =
                (oldStatus === 'backlog' && newStatus === 'in-progress') ||
                (oldStatus === 'in-progress' && newStatus === 'done') ||
                (oldStatus === newStatus);

            if (!validMove) {
                $(this).sortable('cancel');
            }

            task.status = newStatus;

            if (newStatus === 'in-progress' && !task.startTime) {
                const now = new Date();
                const date = now.toLocaleDateString('en-GB');
                const time = now.toLocaleTimeString('en-GB');
                task.startTime = `${date} ${time}`;
                task.responsible = prompt('Enter responsible') || 'N/A'
            }

            if (newStatus === 'done' && !task.endTime) {
                task.endTime = new Date().toLocaleTimeString('en-GB');
            }

            saveTasks();
            renderTasks();
        },

        update: function (event, ui) {
            const status = $(this).closest('.column').attr('id');
            const ids = $(this).children().map(function () {
                return $(this).data('id');
            }).get();

            ids.forEach((id, index) => {
                const task = tasks.find(t => t.id == id);
                if (task) {
                    task.sortOrder = index;
                }
            });

            saveTasks();
        }
    });



}).disableSelection();;

renderTasks();