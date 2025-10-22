import React from 'react'
import { CustomAxiosRequestConfig } from './axiosinstance.types'

export const isProtected: CustomAxiosRequestConfig = {
    requireAuth: true,

}

