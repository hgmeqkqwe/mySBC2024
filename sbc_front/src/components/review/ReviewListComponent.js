import React, {useEffect, useState} from 'react';
import Table from "react-bootstrap/Table";
import useCustomMove from "../../hooks/useCustomMove";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {getList, reviewCheck, search} from "../../api/reviewApi";
import fileImage from "../../images/fileAttatchment.png";
import {Button} from "react-bootstrap";
import BootstrapPagination from "../../admin/components/util/BootstrapPagination";
import BoardSearchComponent from "../../admin/components/util/BoardSearchComponent";
import Modal from "react-bootstrap/Modal";


const initState = {
    dtoList: [],
    pageNumList: [],
    pageRequestDTO: null,
    prev: false,
    next: false,
    totalCount: 0,
    prevPage: 0,
    nextPage: 0,
    totalPage: 0,
    current: 0,
}

const ReviewListComponent = () => {
    const {page, size} = useCustomMove();
    const [currentPage, setCurrentPage] = useState(page);
    const [serverData, setServerData] = useState(initState);
    const [searchParams, setSearchParams] = useState({type: 'name', keyword: ''});
    const navigate = useNavigate();
    const loginState = useSelector((state) => state.loginSlice)

    const {refresh} = useCustomMove();
    const memberId = loginState.member.memberId

    // 선택한 예약 정보 상태 저장
    const [selectRes, setSelectRes] = useState()

    // 첫번째 모달
    const [firstShow, firstSetShow] = useState(false);

    // 모달 컨트롤 함수
    const handleFirstClose = () => firstSetShow(false);
    const handleFirstShow = () => firstSetShow(true);

    // 예약 데이터 저장 관리
    const [resData, setResData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = searchParams.keyword
                    ? await search(searchParams.type, searchParams.keyword, {page: currentPage, size})
                    : await getList({page: currentPage, size});

                console.log(data)
                setServerData(data)

            } catch (error) {
                console.error('API 호출 중 오류 발생:', error);
            }
        };
        fetchData();
    }, [currentPage, size, searchParams]); // currentPage를 의존성으로 추가

    useEffect(() => {
        reviewCheck(memberId)
            .then(data => {
                setResData(data)
                console.log(data)
            }).catch(error => {
            console.log("오류뜸 ㅜㅜ")
        })
    }, [refresh])

    const totalPages = serverData.totalPage

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // 현재 페이지를 업데이트
    }

    const handleSearch = (type, keyword) => {
        setSearchParams({type, keyword});
    }

    const handleAddClick = (res) => {
        setSelectRes(res)
        navigate("/review/add", {
            state: {
                resData:res
            }
        })
    }

    const handleReadClick = (reviewID) => {
        navigate(`/review/read/${reviewID}`)
    }

    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${MM}-${dd}`;
    }

    return (
        <div>
            <Table bordered hover responsive className="text-sm-center">
                <thead>
                <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                </tr>
                </thead>
                <tbody>
                {serverData.dtoList.map(rw => (
                    <tr key={rw.reviewID}>
                        <td>{rw.reviewID}</td>
                        <td onClick={() => handleReadClick(rw.reviewID)} style={{
                            display: 'flex',
                            alignItems: 'center', // 수직 정렬을 중앙으로
                            justifyContent: 'flex-start', // 왼쪽 정렬
                            whiteSpace: 'nowrap' // 텍스트가 줄 바꿈되지 않도록
                        }}>
                            {rw.reviewTitle}
                            {rw.reviewAttachment && (
                                <img
                                    src={fileImage}
                                    alt="첨부 이미지"
                                    style={{
                                        width: '1em', // 글자 크기에 맞춰 조정
                                        height: '1em', // 글자 크기에 맞춰 조정
                                        verticalAlign: 'middle', // 수직 정렬
                                        marginLeft: '4px' // 제목과 이미지 사이 간격 조정
                                    }}
                                />
                            )}
                        </td>
                        <td>{rw.member.memberName}</td>
                        <td>{formatDate(new Date(rw.reviewDate))}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <Button onClick={handleFirstShow}>글쓰기</Button>

            <BootstrapPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
            <BoardSearchComponent onSearch={handleSearch}/>

            <Modal show={firstShow} onHide={handleFirstClose}>
                <Modal.Header closeButton>
                    <Modal.Title>예약내역을 선택해주세요</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table bordered hover responsive className="text-sm-center">
                        <thead>
                        <tr>
                            <th>예약번호</th>
                            <th>퇴실날짜</th>
                            <th>이름</th>
                            <th>캠핑구역 이름</th>
                        </tr>
                        </thead>
                        <tbody>
                        {resData.length === 0 ? (
                            <tr>
                                <td colSpan={5}>예약내역이 존재하지 않습니다</td>
                            </tr>
                        ) : (
                            resData.map(res => (
                                    res.resReview === "N" && (
                                        <tr key={res.resId}>
                                            <td onClick={() => handleAddClick(res)}>{res.resId}</td>
                                            <td>{res.checkoutDate}</td>
                                            <td>{res.resUserName}</td>
                                            <td>{res.site.siteName}</td>
                                        </tr>
                                    )
                                ))
                        )}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary">
                        글쓰기
                    </Button>
                    <Button variant="secondary" onClick={handleFirstClose}>
                        취소
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
};

export default ReviewListComponent;