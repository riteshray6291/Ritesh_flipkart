import Header from "./../components/header/Header";
import Footer from "./../components/footer/Footer";
import Routers from "../routes/Routers";
import CompareTray from "../components/ProductListing/CompareTray";

const Layout = () => {
    return (
        <>
            <Header />
            <main className="min-h-[60vh] w-[100%] bg-[#f1f3f6]">
                <Routers />
            </main>
            <Footer />
            <CompareTray />
        </>
    );
};

export default Layout;
