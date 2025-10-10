import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";
const ControlPosting = ({
  setIsEditing,
  onDelete,
  post,
  position,
  setManageModal,
}) => {
  {
    /**
    
    const modalRef = useRef(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setManageModal(false);
      }
    };

    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setManageModal]);

    */
  }
  const { user } = useAuth();
  const handleEdit = () => {
    setIsEditing(true);
    setManageModal(false);
  };

  const handleDelete = () => {
    onDelete(post.postId);
    setManageModal(false);
  };

  if (user.userId === post.user.communityId) {
    return createPortal(
      <div
        //ref={modalRef}
        className="absolute bg-white border rounded-lg shadow-lg z-[9999]"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        <button onClick={handleEdit} className="flex items-center gap-2 p-2">
          <Pencil size={18} className="text-blue-500" />
          <span>수정</span>
        </button>

        <button onClick={handleDelete} className="flex items-center gap-2 p-2">
          <Trash2 size={18} className="text-red-500" />
          <span>삭제</span>
        </button>
      </div>,
      document.body
    );
  } else {
    return createPortal(
      <div
        //ref={modalRef}
        className="absolute bg-white border rounded-lg shadow-lg z-[9999]"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        <button className="flex items-center gap-2 p-2">
          <span>게시글 신고</span>
        </button>
      </div>,
      document.body
    );
  }
};

export default ControlPosting;
