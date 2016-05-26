var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Popover = ReactBootstrap.Popover;

var About = React.createClass({
    render: function() {
    return (
    <div className="about-div" >
        <div  className="about-div">
            <h1 ><strong>About us</strong></h1>

        </div>
        <div style={{textAlign:'center'}}>
            <h3 > Synchronizing + Scholars = Syncholar</h3>
        </div>
        <div className="about-div2">
            <h4>
            Syncholar is a knowledge sharing platform for research labs and networks. It is created by academics to make their busy lives easier! </h4>
            <h4>Academics use Syncholar to:</h4>
            <ul >
                <li>Create a homepage for their research lab or network and connect their members.</li>
                <li>Store and share their research outputs. </li>
                <li>Stary up-to-date with their networks activities.</li>
                <li>Discover knowledge and expertise.</li>
                <li> streamline collaboration within their networks.</li>
            </ul>
        </div>
        <div className="about-middiv">
            <div >
                <h1><strong>How it works:</strong></h1>
            </div>
            <div className="container marketing">
                <div className="marketing-heading"><h2>For Reseach Labs and Networks</h2> </div>
                <div className="row">
                    <div className="col-md-3"><img src={'/images/Create Profile.png'} alt="Generic placeholder image" width="163" height="140"/>
                        <h2>Create Homepage</h2>
                        <p>
                        Is it hard to create a static website and keep it updated? <br></br> <b>It is way easier on Syncholar!</b>
                        </p>
                    {/*<p><a href="#" role="button" className="btn btn-default">View Details &raquo;</a></p>*/}
                    </div>
                    <div className="col-md-3"><img src={'/images/Connect Members.png'} alt="Generic placeholder image" width="163" height="140"/>
                        <h2>Connect members</h2>
                        <p>
                        Invite your members to connect to your page and you're done! <br></br><b>But not just a profile!</b>
                        </p>
                    </div>
                    <div className="col-md-3"><img src={'/images/Stay up-to-date.png'} alt="Generic placeholder image" width="213" height="140" />
                        <h2>Stay up-to-date</h2>
                        <p>
                        As members work, your homepage content literally updates itself! <br> </br><b>But way more streamlined!</b>
                        </p>
                    </div>
                    <div className="col-md-3"><img src={'/images/Track Outputs.png'} alt="Generic placeholder image" width="110" height="140" />
                        <h2>Track and store</h2>
                        <p>
                        All research outputs will be stored and accessible. Track your impact! <br> <b> But way beyond just publications!</b></br>
                        </p>
                    </div>
                </div>
            </div>
            <hr className="style14">
                <div className="container marketing">
                    <div className="marketing-heading"><h2>For Scholars</h2> </div>
                    <div className="row">
                        <div className="col-md-4"><img src={'/images/Profile Research.png'} alt="Generic placeholder image" width="137" height="140" />
                            <h2>Profile research</h2>
                            <p>
                            Create a dashboard of all your work and research outputs, not just a publications list!
                                <br></br><b>"Science is organized knowledge."</b>-Immanuel Kant
                                </p>
                            </div>
                            <div className="col-md-4"><img src={'/images/Share Knowledge.png'} alt="Generic placeholder image" width="251" height="140" />
                                <h2>Share knowledge</h2>
                                <p>
                                Yes! Open-access, group-share, or just private, you've got the whole range of
                                sharing and privacy setting! <br></br><b>
                                "Let others light their candles in it."</b>-Margaret Fuller
                                </p>
                                </div>
                                <div className="col-md-4"><img src={'/images/Discover Knowledge.png'} alt="Generic placeholder image" width="111.5" height="140" />
                                    <h2>Discover knowledge</h2>
                                    <p>
                                    You may not need to spend hours finding data your colleague has already found!<br></br><b>"The point is to discover them."</b>-Galileo Galilei
                                    </p>
                                </div>
                    </div>
                </div>
            </hr>
        </div>
        <div className="about-div2">
            <div><h2>Our Team</h2> </div>
            <div>
                <div className="col-md-1 "><OverlayTrigger trigger="hover" placement="top" overlay={<Popover title="Troublemaker"><strong>Saeed Ghafghazi</strong> <br></br>Co-founder</Popover>}><img className="team-img" src={'/images/IMG_20160326_114524.jpg'} alt="Generic placeholder image" width="100" height="100"  /></OverlayTrigger> </div>
                <div className="col-md-1 "><OverlayTrigger trigger="hover" placement="top" overlay={<Popover title="Computer Scientologist"><strong>Hirad Roshandel</strong> <br></br>Software Developer</Popover>}><img className="team-img" src={'/images/12023.jpg'} alt="Generic placeholder image" width="100" height="100" /></OverlayTrigger>  </div>
                <div className="col-md-1 "><OverlayTrigger trigger="hover" placement="top" overlay={<Popover title="Appearing soon"><strong>Newton Tse</strong> <br></br>Software Developer</Popover>}><img className="team-img" src={'/images/user.png'} alt="Generic placeholder image" width="100" height="100"/></OverlayTrigger>  </div>
                <div className="col-md-1 "><OverlayTrigger trigger="hover" placement="top" overlay={<Popover title="Picturephobic Minion"><strong>Lisa Li</strong> <br></br>Software Developer</Popover>}><img className="team-img" src={'/images/1423.png'} alt="Generic placeholder image" width="100" height="100" /></OverlayTrigger>  </div>
                <div className="col-md-1 "><OverlayTrigger trigger="hover" placement="top" overlay={<Popover title="A bit artist(ic)"><strong>Shariq Aziz</strong> <br></br>Software Developer</Popover>}><img className="team-img" src={'/images/12309.jpg'} alt="Generic placeholder image" width="100" height="100"/></OverlayTrigger>  </div>

                </div>
        </div>

    </div>

    );
    }
});

$( document ).ready(function() {
    ReactDOM.render(<About />, document.getElementById('content'));
});
