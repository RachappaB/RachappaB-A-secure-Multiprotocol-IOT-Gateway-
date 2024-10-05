import {useState, useEffect} from 'react'
import axios from 'axios'

function UserAPI(token) {
   const [data,setData] = useState([]);

   const [name,setname]=useState('')
   const [email,setEmail]=useState('')
   const [phone,setphone]=useState(0)


    useEffect(() =>{
        
        if(token){
            console.log(token)
            const getUser = async () =>{
                try {
                        const res = await axios.get('/customer/info', {    headers: {Authorization: token}})
                        console.log(res)
                         setname(res.data.user.name)
                         setEmail(res.data.user.email)
                         setphone(res.data.user.phone)
                         console.log(res);
                         console.log(res);

                } catch (err) {
                  
                    alert(err.response.data.msg)
                }

            }
            getUser()
            
        }
    },[token])
        




   

    return {
        name:[name,setname],
        phone:[phone,setphone],
        email:[email,setEmail],
        data:[data,setData],
    }
}

export default UserAPI
 