export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  questionText,
}) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white p-6 rounded-lg w-[32rem] max-w-[90%]'>
        <h2 className='text-xl font-semibold mb-4'>질문 삭제</h2>
        <p className='text-gray-600 mb-4'>다음 질문을 삭제하시겠습니까?</p>
        <p className='bg-gray-50 p-3 rounded mb-6 text-gray-800'>
          {questionText}
        </p>

        <div className='flex justify-end space-x-2'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500'
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
