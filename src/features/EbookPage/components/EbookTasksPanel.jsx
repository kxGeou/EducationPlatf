import TaskPanel from '../../CoursePage/components/TaskPanel';

function EbookTasksPanel({ ebookId }) {
  return <TaskPanel courseId={ebookId} isEbook={true} />;
}

export default EbookTasksPanel;

