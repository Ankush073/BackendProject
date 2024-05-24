import {Router} from 'express'
import {registerUser} from '../controllers/users.controller.js';
import {upload} from "../middlewares/multer.middlewares.js"

const router =Router()
router.route("/register").post(
      upload.fields(
            [
                  {
                        name:"Avtar ",
                        maxCount:1
                  },
            
                  {
                        name:"CoverImage",
                        maxCount:1
                  }
            ]
      ),
      registerUser)
export default router 