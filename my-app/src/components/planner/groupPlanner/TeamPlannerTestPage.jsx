import { useState, useEffect } from 'react';
import { useTeamPlanner } from '../../../hooks/TeamPlannerProvider';

function TeamPlannerTestPage() {
    const {
        planners,
        currentPlanner,
        members,
        loading,
        error,
        user,
        setCurrentPlanner,
        createPlanner,
        fetchPlanners,
        updatePlanner,
        deletePlanner,
        addMember,
        fetchMembers,
        removeMember,
        updateMemberNickname, // updateMemberRole에서 변경됨
    } = useTeamPlanner();

    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        profileImage: '',
    });

    const [updateForm, setUpdateForm] = useState({
        title: '',
        description: '',
        profileImage: '',
    });

    const [memberForm, setMemberForm] = useState({
        memberId: '',
        role: 'member', // memberRole -> role
    });

    const [nicknameForm, setNicknameForm] = useState({
        memberId: '',
        nickname: '', // roleName -> nickname
    });

    useEffect(() => {
        if (user) {
            fetchPlanners();
        }
    }, [user]);

    useEffect(() => {
        if (currentPlanner) {
            fetchMembers(currentPlanner.plannerId);
            setUpdateForm({
                title: currentPlanner.title,
                description: currentPlanner.description,
                profileImage: currentPlanner.profileImageLink || '',
            });
        }
    }, [currentPlanner]);

    // 플래너 생성
    const handleCreatePlanner = async () => {
        try {
            const plannerId = await createPlanner(createForm);
            alert(`플래너 생성 완료! ID: ${plannerId}`);
            setCreateForm({ title: '', description: '', profileImage: '' });
        } catch (err) {
            alert('플래너 생성 실패: ' + err.message);
        }
    };

    // 플래너 수정 (업데이트)
    const handleUpdatePlanner = async () => {
        if (!currentPlanner) {
            alert('플래너를 먼저 선택해주세요.');
            return;
        }
        try {
            await updatePlanner(currentPlanner.plannerId, updateForm);
            alert('플래너 업데이트 완료!');
        } catch (err) {
            alert('플래너 업데이트 실패: ' + err.message);
        }
    };

    // 플래너 삭제
    const handleDeletePlanner = async (plannerId) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deletePlanner(plannerId);
            alert('플래너 삭제 완료!');
        } catch (err) {
            alert('플래너 삭제 실패: ' + err.message);
        }
    };

    // 멤버 추가
    const handleAddMember = async () => {
        if (!currentPlanner) {
            alert('플래너를 먼저 선택해주세요.');
            return;
        }
        try {
            await addMember(
                currentPlanner.plannerId,
                Number(memberForm.memberId),
                memberForm.role // memberRole -> role
            );
            alert('멤버 추가 완료!');
            setMemberForm({ memberId: '', role: 'member' });
        } catch (err) {
            alert('멤버 추가 실패: ' + err.message);
        }
    };

    // 멤버 삭제
    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        if (!currentPlanner) return;
        try {
            await removeMember(currentPlanner.plannerId, memberId);
            alert('멤버 삭제 완료!');
        } catch (err) {
            alert('멤버 삭제 실패: ' + err.message);
        }
    };

    // 멤버 별명 업데이트
    const handleUpdateMemberNickname = async () => {
        if (!currentPlanner) {
            alert('플래너를 먼저 선택해주세요.');
            return;
        }
        try {
            await updateMemberNickname(
                currentPlanner.plannerId,
                Number(nicknameForm.memberId),
                nicknameForm.nickname // roleName -> nickname
            );
            alert('멤버 별명 업데이트 완료!');
            setNicknameForm({ memberId: '', nickname: '' });
        } catch (err) {
            alert('멤버 별명 업데이트 실패: ' + err.message);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Team Planner API 테스트 페이지</h1>

            {user && <p>현재 사용자: {user.username} (ID: {user.userId})</p>}

            {loading && <p style={{ color: 'blue' }}>로딩 중...</p>}
            {error && <p style={{ color: 'red' }}>에러: {error}</p>}

            <hr />

            <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
                <h2>1. 플래너 생성</h2>
                <div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Title: </label>
                        <input
                            type="text"
                            value={createForm.title}
                            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Description: </label>
                        <input
                            type="text"
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Profile Image URL: </label>
                        <input
                            type="text"
                            value={createForm.profileImage}
                            onChange={(e) => setCreateForm({ ...createForm, profileImage: e.target.value })}
                        />
                    </div>
                    <button onClick={handleCreatePlanner}>플래너 생성</button>
                </div>
            </section>

            <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
                <h2>2. 플래너 목록</h2>
                <button onClick={fetchPlanners}>새로고침</button>
                <div style={{ marginTop: '10px' }}>
                    {planners.length === 0 ? (
                        <p>플래너가 없습니다.</p>
                    ) : (
                        planners.map((planner) => (
                            <div
                                key={planner.plannerId || planner.id}
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '10px',
                                    margin: '5px 0',
                                    backgroundColor: currentPlanner?.plannerId === planner.plannerId ? '#e3f2fd' : '#fff',
                                }}
                            >
                                <p><strong>전체 데이터:</strong> {JSON.stringify(planner)}</p>
                                <p><strong>Planner ID:</strong> {planner.plannerId}</p>
                                <p><strong>Title:</strong> {planner.title}</p>
                                <p><strong>Description:</strong> {planner.description}</p>
                                <p><strong>Profile Image:</strong> {planner.profileImageLink || '없음'}</p>
                                <p><strong>Members:</strong> {planner.members?.length || 0}명</p>
                                <button onClick={() => {
                                    console.log('선택된 planner:', planner);
                                    setCurrentPlanner(planner);
                                }}>선택  |</button>
                                <button onClick={() => {
                                    const id = planner.plannerId;
                                    console.log('삭제할 ID:', id);
                                    if (!id) {
                                        alert('플래너 ID가 없습니다!');
                                        return;
                                    }
                                    handleDeletePlanner(id);
                                }}>|  삭제</button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {currentPlanner && (
                <>
                    <section style={{ marginBottom: '30px', border: '2px solid #2196F3', padding: '15px' }}>
                        <h2>3. 선택된 플래너: {currentPlanner.title}</h2>
                        <div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Title: </label>
                                <input
                                    type="text"
                                    value={updateForm.title}
                                    onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Description: </label>
                                <input
                                    type="text"
                                    value={updateForm.description}
                                    onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Profile Image URL: </label>
                                <input
                                    type="text"
                                    value={updateForm.profileImage}
                                    onChange={(e) => setUpdateForm({ ...updateForm, profileImage: e.target.value })}
                                />
                            </div>
                            <button onClick={handleUpdatePlanner}>플래너 업데이트</button>
                        </div>
                    </section>

                    <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
                        <h2>4. 멤버 추가</h2>
                        <div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Member ID (User ID): </label>
                                <input
                                    type="number"
                                    value={memberForm.memberId}
                                    onChange={(e) => setMemberForm({ ...memberForm, memberId: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Role: </label>
                                <select
                                    value={memberForm.role}
                                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                >
                                    <option value="member">member</option>
                                    <option value="manager">manager</option>
                                </select>
                            </div>
                            <button onClick={handleAddMember}>멤버 추가</button>
                        </div>
                    </section>

                    <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
                        <h2>5. 멤버 목록 (MemberDto)</h2>
                        <button onClick={() => fetchMembers(currentPlanner.plannerId)}>새로고침</button>
                        <div style={{ marginTop: '10px' }}>
                            {members.length === 0 ? (
                                <p>멤버가 없습니다.</p>
                            ) : (
                                members.map((member) => (
                                    <div
                                        key={member.userId}
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '10px',
                                            margin: '5px 0',
                                            backgroundColor: '#f9f9f9',
                                        }}
                                    >
                                        <p><strong>전체 데이터:</strong> {JSON.stringify(member)}</p>
                                        <p><strong>User ID:</strong> {member.userId}</p>
                                        <p><strong>Username:</strong> {member.username}</p>
                                        <p><strong>Nickname:</strong> {member.nickname || '(없음)'}</p>
                                        <p><strong>Email:</strong> {member.email}</p>
                                        <p><strong>Role:</strong> {member.role}</p>
                                        <p><strong>Status:</strong> {member.status}</p>
                                        <p><strong>Profile Image:</strong> {member.profileImage || '없음'}</p>
                                        <button onClick={() => handleRemoveMember(member.userId)}>멤버 삭제</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
                        <h2>6. 멤버 별명(Nickname) 업데이트</h2>
                        <div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Member ID: </label>
                                <input
                                    type="number"
                                    value={nicknameForm.memberId}
                                    onChange={(e) => setNicknameForm({ ...nicknameForm, memberId: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Nickname (별명): </label>
                                <input
                                    type="text"
                                    value={nicknameForm.nickname}
                                    onChange={(e) => setNicknameForm({ ...nicknameForm, nickname: e.target.value })}
                                />
                            </div>
                            <button onClick={handleUpdateMemberNickname}>별명 업데이트</button>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

export default TeamPlannerTestPage;