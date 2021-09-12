
import './Header.css';
import Logo from '../../components/logo/Logo';
import { NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Header = () => (
    <header className="header">
        <div className="main">
            <Link to="/" className="logoLink">
                <Logo/>
            </Link>
            <h1 className="pageTitle">vrbrt</h1>
            <SubTitle subTitle="java react k8s"/>
        </div>
        <nav className="branchMenu">
            <ul className="navbar">
                <NavLink to="/java" className="item">
                    <li>java.Spring</li>
                </NavLink>
                {/* <NavLink to="/react" className="item">
                    <li>javascript.React</li>
                </NavLink>
                <NavLink to="/k8s" className="item">
                    <li>k8s.Kubernetes</li>
                </NavLink>
                <NavLink to="/stacktrace" className="item">
                    <li>exception.Stacktrace</li>
                </NavLink> */}
                <a href="https://www.github.com/vrbrt" className="item">
                    <li>com.Github</li>
                </a>
            </ul>
        </nav>
    </header>)

export default Header;

const SubTitle = ({subTitle}) => {
    
    const[visible,setVisible] = useState(0);
    const[step,setStep] = useState(1);

    useEffect(() => {
        if(visible <= subTitle.length && visible >= 0){
            window.setTimeout(() => setVisible(visible+step),500);
        }
        if(visible === 0) {
            setStep(1);
        }
        if(visible >= subTitle.length) {
            setStep(-1);
        }
    },[subTitle,visible,step]);

    const visibleTitle = subTitle.slice(0,visible);
    const hiddenTitle = subTitle.slice(visible);

    return (<sub className="subTitle"><span className="visible">{visibleTitle}</span><span className="hidden">{hiddenTitle}</span></sub>)
}