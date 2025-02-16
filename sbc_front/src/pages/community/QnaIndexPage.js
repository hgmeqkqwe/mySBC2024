import { Outlet } from "react-router-dom";
import BasicLayout from "../../layouts/BasicLayout";
import CommunityMenu from "../../layouts/CommunityMenu";
import useCustomLogin from "../../hooks/useCustomLogin";

const QnaIndexPage = () =>{
    // 로그인 여부 확인
    const {isLogin, moveToLoginReturn} = useCustomLogin()
    if(!isLogin){
        alert('이 페이지에 접근하려면 로그인이 필요합니다');
        return moveToLoginReturn()
    }

    return(
        <BasicLayout>
            <CommunityMenu/>
            <div>
                <div>
                    <div><h1>문의 게시판</h1></div>
                    <hr/>
                </div>
                <div>
                    <Outlet/>
                </div>

            </div>
        </BasicLayout>
    );
}

export default QnaIndexPage;