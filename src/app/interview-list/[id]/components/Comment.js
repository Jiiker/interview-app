"use client";

const Comment = ({ name, content, timestamp }) => {
  return (
    <div className='p-4 bg-gray-100 rounded-lg shadow-sm mb-2'>
      <div className='text-sm font-semibold'>{name}</div>
      <div className='text-xs text-gray-500'>
        {new Date(timestamp).toLocaleString()}
      </div>
      <p className='mt-2 text-sm'>{content}</p>
    </div>
  );
};

export default Comment;
