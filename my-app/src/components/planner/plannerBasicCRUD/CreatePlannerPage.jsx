import { useState, useEffect } from "react";

const CreatePlannerPage = () => {
  // 플래너 생성
  const handleCreatePlanner = async () => {
    try {
      const plannerId = await createPlanner(createForm);
      alert(`플래너 생성 완료! ID: ${plannerId}`);
      setCreateForm({ title: "", description: "", profileImage: "" });
    } catch (err) {
      alert("플래너 생성 실패: " + err.message);
    }
  };
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    profileImage: "",
  });
  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <label>Title: </label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            setCreateForm({ ...createForm, title: e.target.value })
          }
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Description: </label>
        <input
          type="text"
          value={createForm.description}
          onChange={(e) =>
            setCreateForm({ ...createForm, description: e.target.value })
          }
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Profile Image URL: </label>
        <input
          type="text"
          value={createForm.profileImage}
          onChange={(e) =>
            setCreateForm({ ...createForm, profileImage: e.target.value })
          }
        />
      </div>
      <button onClick={handleCreatePlanner}>플래너 생성</button>
    </div>
  );
};
export default CreatePlannerPage;
